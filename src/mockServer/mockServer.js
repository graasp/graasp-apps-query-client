import { createServer, Model, Factory, RestSerializer } from 'miragejs';
import { v4 } from 'uuid';
import { API_ROUTES } from '../api/routes';
import { buildMockLocalContext } from './fixtures';

const {
  buildGetAppDataRoute,
  buildGetContextRoute,
  buildPostAppDataRoute,
  buildPatchAppDataRoute,
  buildDeleteAppDataRoute,
  buildPatchSettingsRoute,
} = API_ROUTES;

const ApplicationSerializer = RestSerializer.extend({
  root: false,
  embed: true,
});

const setupApi = ({
  database = {
    appData: [],
    members: [MOCK_SERVER_MEMBER],
  },
  appContext = buildMockLocalContext(),
} = {}) => {
  const { appData, members } = database;
  const { itemId: currentItemId, memberId: currentMemberId, apiHost } = appContext;

  // we cannot use *Data
  // https://github.com/miragejs/miragejs/issues/782
  return createServer({
    // environment
    urlPrefix: apiHost,
    models: {
      appDataResource: Model,
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
      member: Factory.extend({
        id: (attrs) => {
          return attrs?.id ?? v4();
        },
      }),
    },

    serializers: {
      appDataResource: ApplicationSerializer,
      member: ApplicationSerializer,
    },
    seeds(server) {
      appData?.forEach((d) => {
        server.create('appDataResource', d);
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
          const { id } = request.params;
          const appData = schema.appDataResources.findBy({ id });
          return appData.destroy();
        },
      );

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
    },
  });
};

export default setupApi;
