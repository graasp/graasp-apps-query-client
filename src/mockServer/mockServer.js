import { createServer, Model, Factory, RestSerializer, Response } from 'miragejs';
import { v4 } from 'uuid';
import { API_ROUTES } from '../api/routes';
import { buildMockLocalContext } from './fixtures';

const {
  buildGetAppDataRoute,
  buildGetContextRoute,
  buildPostAppDataRoute,
  buildPatchAppDataRoute,
  buildDeleteAppDataRoute,
  buildUploadFilesRoute,
  buildDeleteAppSettingRoute,
  buildDownloadFileRoute,
  buildGetAppActionRoute,
  buildGetAppSettingsRoute,
  buildPatchAppSettingRoute,
  buildPostAppActionRoute,
  buildPostAppSettingRoute,
} = API_ROUTES;

const ApplicationSerializer = RestSerializer.extend({
  root: false,
  embed: true,
});

const setupApi = ({
  database = {
    appData: [],
    appAction: [],
    appSettings: [],
    members: [MOCK_SERVER_MEMBER],
  },
  appContext = buildMockLocalContext(),
  errors = {},
} = {}) => {
  const { appData, appAction, appSettings, members } = database;
  const { itemId: currentItemId, memberId: currentMemberId, apiHost } = appContext;
  // mocked errors
  const { deleteAppDataShouldThrow } = errors;

  // we cannot use *Data
  // https://github.com/miragejs/miragejs/issues/782
  return createServer({
    // environment
    urlPrefix: apiHost,
    models: {
      appDataResource: Model,
      appActionResource: Model,
      appSetting: Model,
      member: Model,
    },
    factories: {
      appDataResource: Factory.extend({
        createdAt: Date.now(),
        data: (attrs) => {
          return attrs.data;
        },
        type: (attrs) => {
          return attrs.type;
        },
        id: (attrs) => {
          return attrs?.id ?? v4();
        },
        itemId: currentItemId,
        memberId: currentMemberId,
      }),
      appActionResource: Factory.extend({
        createdAt: Date.now(),
        data: (attrs) => {
          return attrs.data;
        },
        type: (attrs) => {
          return attrs.type;
        },
        memberId: currentMemberId,
      }),
      appSetting: Factory.extend({
        createdAt: Date.now(),
        updatedAt: Date.now(),
        data: (attrs) => {
          return attrs.data;
        },
        name: (attrs) => {
          return attrs.name;
        },
        id: (attrs) => {
          return attrs?.id ?? v4();
        },
        itemId: currentItemId,
      }),
      member: Factory.extend({
        id: (attrs) => {
          return attrs?.id ?? v4();
        },
      }),
    },

    serializers: {
      appDataResource: ApplicationSerializer,
      appActionResource: ApplicationSerializer,
      appSetting: ApplicationSerializer,
      member: ApplicationSerializer,
    },
    seeds(server) {
      appData?.forEach((d) => {
        server.create('appDataResource', d);
      });
      appAction?.forEach((d) => {
        server.create('appActionResource', d);
      });
      appSettings?.forEach((d) => {
        server.create('appSetting', d);
      });
      members?.forEach((m) => {
        server.create('member', m);
      });
    },
    routes() {
      // app data
      this.get(`/${buildGetAppDataRoute(currentItemId)}`, (schema) => {
        return schema.appDataResources.all();
      });
      this.post(`/${buildPostAppDataRoute({ itemId: currentItemId })}`, (schema, request) => {
        const { requestBody } = request;
        const data = JSON.parse(requestBody);
        return schema.appDataResources.create({
          ...data,
          itemId: currentItemId,
          memberId: currentMemberId,
        });
      });
      this.patch(
        `/${buildPatchAppDataRoute({ itemId: currentItemId, id: ':id' })}`,
        (schema, request) => {
          const { id } = request.params;
          const { requestBody } = request;
          const data = JSON.parse(requestBody);
          const a = schema.appDataResources.findBy({ id });
          return a.update({ ...a.attrs, ...data });
        },
      );
      this.delete(
        `/${buildDeleteAppDataRoute({ itemId: currentItemId, id: ':id' })}`,
        (schema, request) => {
          if (deleteAppDataShouldThrow) {
            return new Response(400, {}, { errors: [deleteAppDataShouldThrow] });
          }
          const { id } = request.params;
          const appData = schema.appDataResources.findBy({ id });
          return appData.destroy();
        },
      );

      // app actions
      this.get(`/${buildGetAppActionRoute(currentItemId)}`, (schema) => {
        return schema.appActionResources.all();
      });
      this.post(`/${buildPostAppActionRoute({ itemId: currentItemId })}`, (schema, request) => {
        const { requestBody } = request;
        const data = JSON.parse(requestBody);
        return schema.appActionResources.create({
          ...data,
          itemId: currentItemId,
          memberId: currentMemberId,
        });
      });

      // app settings
      this.get(`/${buildGetAppSettingsRoute(currentItemId)}`, (schema) => {
        return schema.appSettings.all();
      });

      this.post(`/${buildPostAppSettingRoute({ itemId: currentItemId })}`, (schema, request) => {
        const { requestBody } = request;
        const data = JSON.parse(requestBody);
        return schema.appSettings.create({
          ...data,
          itemId: currentItemId,
          memberId: currentMemberId,
        });
      });
      this.patch(
        `/${buildPatchAppSettingRoute({ itemId: currentItemId, id: ':id' })}`,
        (schema, request) => {
          const { id } = request.params;
          const { requestBody } = request;
          const data = JSON.parse(requestBody);
          const a = schema.appSettings.findBy({ id });
          return a.update({ ...a.attrs, ...data });
        },
      );
      this.delete(
        `/${buildDeleteAppSettingRoute({ itemId: currentItemId, id: ':id' })}`,
        (schema, request) => {
          if (deleteAppDataShouldThrow) {
            return new Response(400, {}, { errors: [deleteAppDataShouldThrow] });
          }
          const { id } = request.params;
          const data = schema.appSettings.findBy({ id });
          return data.destroy();
        },
      );

      // context
      this.get(`/${buildGetContextRoute(currentItemId)}`, (schema) => {
        return {
          members: schema.members.all().models,
        };
      });

      // files
      this.get(`/${buildDownloadFileRoute(':id')}`, (schema, request) => {
        const { id } = request.params;
        const appData = schema.appDataResources.findBy({ id });
        // this call returns the app data itself for simplification
        return appData;
      });
      this.post(`/${buildUploadFilesRoute(currentItemId)})`, (schema, request) => {
        return schema.appDataResources.create({
          data: request,
          itemId: currentItemId,
          memberId: currentMemberId,
        });
      });
    },
  });
};

export default setupApi;
