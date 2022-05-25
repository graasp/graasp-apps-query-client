import { createServer, Model, Factory, RestSerializer, Response } from 'miragejs';
import { v4 } from 'uuid';
import { API_ROUTES } from '../api/routes';
import { AppAction, AppData, AppSetting, Database, LocalContext, Member } from '../types';
import { buildMockLocalContext, MOCK_SERVER_ITEM, MOCK_SERVER_MEMBER } from './fixtures';

const {
  buildGetAppDataRoute,
  buildGetContextRoute,
  buildPostAppDataRoute,
  buildPatchAppDataRoute,
  buildDeleteAppDataRoute,
  buildUploadFilesRoute,
  buildDeleteAppSettingRoute,
  buildDownloadFileRoute,
  buildGetAppActionsRoute,
  buildGetAppSettingsRoute,
  buildPatchAppSettingRoute,
  buildPostAppActionRoute,
  buildPostAppSettingRoute,
} = API_ROUTES;

const ApplicationSerializer = RestSerializer.extend({
  root: false,
  embed: true,
});

export const buildDatabase = ({ appData, appActions, appSettings, members }: Database) => ({
  appData: appData ?? [],
  appActions: appActions ?? [],
  appSettings: appSettings ?? [],
  members: members ?? [MOCK_SERVER_MEMBER],
});

const setupApi = ({
  database = {
    appData: [],
    appActions: [],
    appSettings: [],
    members: [MOCK_SERVER_MEMBER],
  },
  appContext = buildMockLocalContext(),
  errors = {},
}: {
  database?: Database;
  appContext?: LocalContext;
  errors?: {
    deleteAppDataShouldThrow?: boolean;
  };
} = {}) => {
  const { appData, appActions, appSettings, members } = database;
  const {
    itemId: currentItemId = MOCK_SERVER_ITEM.id,
    memberId: currentMemberId = MOCK_SERVER_MEMBER.id,
    apiHost,
  } = appContext;
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
      appDataResource: Factory.extend<AppData>({
        createdAt: Date.now().toString(),
        updatedAt: Date.now().toString(),
        data: (_attrs) => {
          return {}; //attrs.data;
        },
        type: (_attrs) => {
          return 'type'; //attrs.type;
        },
        id: (_attrs) => {
          return v4(); //attrs?.id ??;
        },
        itemId: currentItemId,
        memberId: currentMemberId,
        creator: currentMemberId,
      }),
      appActionResource: Factory.extend<AppAction>({
        createdAt: Date.now().toString(),
        data: (_attrs) => {
          return {}; // attrs.data;
        },
        type: (_attrs) => {
          return 'typeac'; //attrs.type;
        },
        memberId: currentMemberId,
        id: v4(),
        itemId: currentItemId,
      }),
      appSetting: Factory.extend<AppSetting>({
        createdAt: Date.now().toString(),
        updatedAt: Date.now().toString(),
        data: (_attrs) => {
          return {}; //attrs.data;
        },
        name: (_attrs) => {
          return 'ef'; // attrs.name;
        },
        id: (_attrs) => {
          return v4(); //attrs?.id ??
        },
        itemId: currentItemId,
      }),
      member: Factory.extend<Member>({
        id: (_attrs) => {
          return v4(); //attrs?.id ??
        },
        email: 'email',
        name: 'name',
        extra: {},
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
      appActions?.forEach((d) => {
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
        return schema.all('appDataResource');
      });
      this.post(`/${buildPostAppDataRoute({ itemId: currentItemId })}`, (schema, request) => {
        const { requestBody } = request;
        const data = JSON.parse(requestBody);
        return schema.create('appDataResource', {
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
          const a = schema.findBy('appDataResource', { id });
          if (!a) {
            return new Response(404, {}, { errors: ['not found'] });
          }
          a.update({ ...a.attrs, ...data });
          return a.attrs;
        },
      );
      this.delete(
        `/${buildDeleteAppDataRoute({ itemId: currentItemId, id: ':id' })}`,
        (schema, request) => {
          if (deleteAppDataShouldThrow) {
            return new Response(400, {}, { errors: [deleteAppDataShouldThrow] });
          }
          const { id } = request.params;
          const appData = schema.findBy('appDataResource', { id });
          if (!appData) {
            return new Response(404, {}, { errors: ['not found'] });
          }
          appData.destroy();
          return appData.attrs;
        },
      );

      // app actions
      this.get(`/${buildGetAppActionsRoute(currentItemId)}`, (schema) => {
        return schema.all('appActionResource');
      });
      this.post(`/${buildPostAppActionRoute({ itemId: currentItemId })}`, (schema, request) => {
        const { requestBody } = request;
        const data = JSON.parse(requestBody);
        return schema.create('appActionResource', {
          ...data,
          itemId: currentItemId,
          memberId: currentMemberId,
        });
      });

      // app settings
      this.get(`/${buildGetAppSettingsRoute(currentItemId)}`, (schema) => {
        return schema.all('appSetting');
      });

      this.post(`/${buildPostAppSettingRoute({ itemId: currentItemId })}`, (schema, request) => {
        const { requestBody } = request;
        const data = JSON.parse(requestBody);
        return schema.create('appSetting', {
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
          const a = schema.findBy('appSetting', { id });
          if (!a) {
            return new Response(404, {}, { errors: ['not found'] });
          }
          a.update({ ...a.attrs, ...data });
          return a.attrs;
        },
      );
      this.delete(
        `/${buildDeleteAppSettingRoute({ itemId: currentItemId, id: ':id' })}`,
        (schema, request) => {
          if (deleteAppDataShouldThrow) {
            return new Response(400, {}, { errors: [deleteAppDataShouldThrow] });
          }
          const { id } = request.params;
          const data = schema.findBy('appSetting', { id });
          if (!data) {
            return new Response(404, {}, { errors: ['not found'] });
          }
          data.destroy();
          return data.attrs;
        },
      );

      // context
      this.get(`/${buildGetContextRoute(currentItemId)}`, (schema) => {
        // todo: complete returned data
        return {
          members: schema.all('member').models,
        };
      });

      // files
      this.get(`/${buildDownloadFileRoute(':id')}`, (schema, request) => {
        const { id } = request.params;
        const appData = schema.findBy('appDataResource', { id });
        // this call returns the app data itself for simplification
        return appData;
      });
      this.post(`/${buildUploadFilesRoute(currentItemId)})`, (schema, _request) => {
        // const appData: Partial<AppData> = {
        //   data: {},
        //   itemId: currentItemId,
        //   memberId: currentMemberId,
        // }
        return schema.create('appDataResource');
      });
    },
  });
};

export default setupApi;
