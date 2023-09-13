import { v4 } from 'uuid';
import { createServer, Model, Factory, RestSerializer, Response, Request } from 'miragejs';
import { API_ROUTES, buildUploadAppDataFilesRoute } from '../api/routes';

import { buildMockLocalContext, MOCK_SERVER_ITEM, MOCK_SERVER_MEMBER } from './fixtures';
import { Database, LocalContext } from 'src/types';
import { AppAction, AppData, AppDataVisibility, AppSetting, Member, MemberType } from '@graasp/sdk';

const {
  buildGetAppDataRoute,
  buildGetContextRoute,
  buildPostAppDataRoute,
  buildPatchAppDataRoute,
  buildDeleteAppDataRoute,
  buildDeleteAppSettingRoute,
  buildDownloadAppDataFileRoute,
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

type ExternalUrls = (((req: Request) => unknown) | string)[];

const buildAppDataDownloadUrl = (id: string) => `/download-app-data-url/${id}`;

export const buildDatabase = ({
  appData = [],
  appActions = [],
  appSettings = [],
  members = [MOCK_SERVER_MEMBER],
  items = [MOCK_SERVER_ITEM],
}: Partial<Database> = {}) => ({
  appData,
  appActions,
  appSettings,
  members,
  items,
});

export const mockServer = ({
  database = buildDatabase(),
  appContext = buildMockLocalContext(),
  externalUrls = [],
  errors = {},
}: {
  database?: Database;
  appContext: Partial<LocalContext> & Pick<LocalContext, 'itemId'>;
  externalUrls?: ExternalUrls;
  errors?: {
    deleteAppDataShouldThrow?: boolean;
  };
}) => {
  const { appData, appActions, appSettings, members, items } = database;
  const {
    itemId: currentItemId,
    memberId: currentMemberId = MOCK_SERVER_MEMBER.id,
    apiHost,
  } = appContext;
  // mocked errors
  const { deleteAppDataShouldThrow } = errors;

  // todo: improve?
  // build random item and member or use mocks
  const currentMember: Member =
    currentMemberId === MOCK_SERVER_MEMBER.id
      ? MOCK_SERVER_MEMBER
      : {
          id: currentMemberId,
          name: 'current-member-name',
          email: 'memberId@email.com',
          extra: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          type: MemberType.Individual,
        };
  const currentItem = items.find(({ id }) => id === currentItemId);
  if (!currentItem) {
    throw new Error('context.itemId does not have a corresponding item in mocked database');
  }

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
        createdAt: () => new Date(),
        updatedAt: () => new Date(),
        data: () => ({}),
        type: (idx) => `app-data-type-${idx}`,
        item: currentItem,
        member: currentMember,
        creator: currentMember,
        visibility: () => AppDataVisibility.Member, // TODO: Is it right?
      }),
      appActionResource: Factory.extend<AppAction>({
        id: () => v4(),
        item: currentItem,
        member: currentMember,
        createdAt: new Date(),
        data: () => ({}),
        type: 'app-action-type',
      }),
      appSetting: Factory.extend<AppSetting>({
        id: () => v4(),
        data: () => ({}),
        createdAt: new Date(),
        updatedAt: new Date(),
        name: (idx) => `app-setting-${idx}`,
        item: currentItem,
        creator: currentMember,
      }),
      member: Factory.extend<Member>({
        id: () => v4(),
        extra: () => ({}),
        email: (idx) => `app-setting-email-${idx}`,
        name: (idx) => `member-${idx}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        type: MemberType.Individual,
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
      this.get(`/${buildGetAppDataRoute(currentItem.id)}`, (schema) => {
        return schema.all('appDataResource') ?? [];
      });
      this.post(`/${buildPostAppDataRoute({ itemId: currentItem.id })}`, (schema, request) => {
        if (!currentMember) {
          return new Response(401, {}, { errors: ['user not authenticated'] });
        }

        const { requestBody } = request;
        const data = JSON.parse(requestBody);
        return schema.create('appDataResource', {
          item: currentItem,
          member: currentMember,
          creator: currentMember,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...data,
        });
      });
      this.patch(
        `/${buildPatchAppDataRoute({ itemId: currentItem.id, id: ':id' })}`,
        (schema, request) => {
          if (!currentMember) {
            return new Response(401, {}, { errors: ['user not authenticated'] });
          }

          const { id } = request.params;
          const { requestBody } = request;
          const data = JSON.parse(requestBody);
          const a = schema.findBy('appDataResource', { id });
          if (!a) {
            return new Response(404, {}, { errors: ['not found'] });
          }
          a.update({
            ...a.attrs,
            updatedAt: new Date().toISOString(),
            ...data,
          });
          return a.attrs;
        },
      );
      this.delete(
        `/${buildDeleteAppDataRoute({ itemId: currentItem.id, id: ':id' })}`,
        (schema, request) => {
          if (deleteAppDataShouldThrow) {
            return new Response(400, {}, { errors: [deleteAppDataShouldThrow] });
          }

          if (!currentMember) {
            return new Response(401, {}, { errors: ['user not authenticated'] });
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
      this.get(`/${buildGetAppActionsRoute(currentItem.id)}`, (schema) => {
        return schema.all('appActionResource') ?? [];
      });
      this.post(`/${buildPostAppActionRoute({ itemId: currentItem.id })}`, (schema, request) => {
        const { requestBody } = request;
        const data = JSON.parse(requestBody);
        return schema.create('appActionResource', {
          ...data,
          item: currentItem,
          member: currentMember,
        });
      });

      // app settings
      this.get(`/${buildGetAppSettingsRoute(currentItem.id)}`, (schema) => {
        return schema.all('appSetting') ?? [];
      });

      this.post(`/${buildPostAppSettingRoute({ itemId: currentItem.id })}`, (schema, request) => {
        if (!currentMember) {
          return new Response(401, {}, { errors: ['user not authenticated'] });
        }

        const { requestBody } = request;
        const data = JSON.parse(requestBody);
        return schema.create('appSetting', {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          item: currentItem,
          member: currentMember,
          ...data,
        });
      });
      this.patch(
        `/${buildPatchAppSettingRoute({ itemId: currentItem.id, id: ':id' })}`,
        (schema, request) => {
          if (!currentMember) {
            return new Response(401, {}, { errors: ['user not authenticated'] });
          }

          const { id } = request.params;
          const { requestBody } = request;
          const data = JSON.parse(requestBody);
          const a = schema.findBy('appSetting', { id });
          if (!a) {
            return new Response(404, {}, { errors: ['not found'] });
          }
          a.update({
            ...a.attrs,
            updatedAt: new Date().toISOString(),
            ...data,
          });
          return a.attrs;
        },
      );
      this.delete(
        `/${buildDeleteAppSettingRoute({ itemId: currentItem.id, id: ':id' })}`,
        (schema, request) => {
          if (!currentMember) {
            return new Response(401, {}, { errors: ['user not authenticated'] });
          }

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
      this.get(`/${buildGetContextRoute(currentItem.id)}`, (schema) => {
        // todo: complete returned data
        return {
          members: schema.all('member').models,
        };
      });

      // files
      // needs double mock redirection for download file
      this.get(`/${buildDownloadAppDataFileRoute(':id')}`, (schema, request) => {
        const { id } = request.params;
        // this call returns the app data itself for simplification
        return buildAppDataDownloadUrl(id);
      });
      this.get(`/${buildAppDataDownloadUrl(':id')}`, (schema, request) => {
        const { id } = request.params;
        const appData = schema.findBy('appDataResource', { id });
        // this call returns the app data itself for simplification
        // bug: this is supposed to be a blob
        return appData;
      });

      this.post(`/${buildUploadAppDataFilesRoute(currentItem.id)})`, (schema) => {
        // const appData: Partial<AppData> = {
        //   data: {},
        //   itemId: currentItemId,
        //   memberId: currentMemberId,
        // }
        return schema.create('appDataResource');
      });

      // passthrough external urls
      externalUrls.forEach((url) => {
        this.passthrough(url);
      });
    },
  });
};

const mockApi = ({
  appContext: c,
  database,
  externalUrls,
  errors,
}: {
  appContext: Partial<LocalContext> & Pick<LocalContext, 'itemId'>;
  database?: Database;
  externalUrls?: ExternalUrls;
  errors?: {
    deleteAppDataShouldThrow?: boolean;
  };
}) => {
  const appContext = buildMockLocalContext(c);
  // automatically append item id as a query string
  const searchParams = new URLSearchParams(window.location.search);
  if (!searchParams.get('itemId')) {
    searchParams.set('itemId', appContext.itemId);
    window.location.search = searchParams.toString();
  }
  mockServer({ database: buildDatabase(database), appContext, externalUrls, errors });
};

export default mockApi;
