import { createServer, Model, Factory, RestSerializer, Response } from 'miragejs';
import { v4 } from 'uuid';
import { API_ROUTES, buildDownloadFileRoute } from '../api/routes';
import { buildMockLocalContext } from './fixtures';

const {
  buildGetAppDataRoute,
  buildGetContextRoute,
  buildPostAppDataRoute,
  buildPatchAppDataRoute,
  buildDeleteAppDataRoute,
  buildGetAppActionsRoute,
  buildPostAppActionsRoute,
  buildPatchSettingsRoute,
  buildUploadFilesRoute,
} = API_ROUTES;

const ApplicationSerializer = RestSerializer.extend({
  root: false,
  embed: true,
});

const setupApi = ({
  database = {
    appData: [],
    appAction: [],
    members: [MOCK_SERVER_MEMBER],
  },
  appContext = buildMockLocalContext(),
  errors = {},
} = {}) => {
  const { appData, appActions, members } = database;
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
      appActionsResource: Model,
      member: Model,
    },
    factories: {
      appDataResource: Factory.extend({
        createdAt: Date.now(),
        settings: {},
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
        id: (attrs) => {
          return attrs?.id ?? v4();
        },
        itemId: currentItemId,
        memberId: currentMemberId,
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
      member: ApplicationSerializer,
    },
    seeds(server) {
      appData?.forEach((d) => {
        server.create('appDataResource', d);
      });
      appAction?.forEach((d) => {
        server.create('appActionResource', d);
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

      // context
      this.get(`/${buildGetContextRoute(currentItemId)}`, (schema) => {
        return {
          members: schema.members.all().models,
        };
      });

      // settings
      this.patch(`/${buildPatchSettingsRoute({ itemId: currentItemId })}`, (schema, request) => {
        // query client edits the context
        const { requestBody } = request;
        const data = JSON.parse(requestBody);
        return data;
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
