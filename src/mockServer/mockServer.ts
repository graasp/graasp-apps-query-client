import { v4 } from 'uuid';
import { createServer, Model, Factory, RestSerializer, Response } from 'miragejs';
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

export const buildDatabase = ({
  appData = [],
  appActions = [],
  appSettings = [],
  members = [MOCK_SERVER_MEMBER],
}: Partial<Database> = {}) => ({
  appData,
  appActions,
  appSettings,
  members,
});

export const mockServer = ({
  database = buildDatabase(),
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
        id: () => v4(),
        createdAt: () => Date.now().toString(),
        updatedAt: () => Date.now().toString(),
        data: () => ({}),
        type: (idx) => `app-data-type-${idx}`,
        itemId: currentItemId,
        memberId: currentMemberId,
        creator: currentMemberId,
      }),
      appActionResource: Factory.extend<AppAction>({
        id: () => v4(),
        itemId: currentItemId,
        memberId: currentMemberId,
        createdAt: Date.now().toString(),
        data: () => ({}),
        type: 'app-action-type',
      }),
      appSetting: Factory.extend<AppSetting>({
        id: () => v4(),
        data: () => ({}),
        createdAt: Date.now().toString(),
        updatedAt: Date.now().toString(),
        name: (idx) => `app-setting-${idx}`,
        itemId: currentItemId,
      }),
      member: Factory.extend<Member>({
        id: () => v4(),
        extra: () => ({}),
        email: (idx) => `app-setting-email-${idx}`,
        name: (idx) => `member-${idx}`,
      }),
    },

    serializers: {
      appDataResource: ApplicationSerializer,
      appActionResource: ApplicationSerializer,
      appSetting: ApplicationSerializer,
      member: ApplicationSerializer,
    },
    seeds(server) {
      appData?.forEach((data) => {
        server.create('appDataResource', data);
      });
      appActions?.forEach((data) => {
        server.create('appActionResource', data);
      });
      appSettings?.forEach((data) => {
        server.create('appSetting', data);
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
          itemId: currentItemId,
          memberId: currentMemberId,
          creator: currentMemberId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          ...data,
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
          a.update({
            ...a.attrs,
            updatedAt: Date.now(),
            ...data,
          });
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
          createdAt: Date.now(),
          updatedAt: Date.now(),
          itemId: currentItemId,
          memberId: currentMemberId,
          ...data,
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
          a.update({
            ...a.attrs,
            updatedAt: Date.now(),
            ...data,
          });
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
      this.post(`/${buildUploadFilesRoute(currentItemId)})`, (schema) => {
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

const mockApi = ({
  appContext: c,
  database,
}: { appContext?: LocalContext; database?: Database } = {}) => {
  const appContext = buildMockLocalContext(c);
  // automatically append item id as a query string
  const searchParams = new URLSearchParams(window.location.search);
  if (!searchParams.get('itemId')) {
    searchParams.set('itemId', appContext.itemId);
    window.location.search = searchParams.toString();
  }
  mockServer({ database: buildDatabase(database), appContext });
};

export default mockApi;
