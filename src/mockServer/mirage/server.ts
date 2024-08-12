import {
  AppAction,
  AppData,
  AppDataVisibility,
  AppSetting,
  CompleteMember,
  MemberFactory,
  MemberType,
} from '@graasp/sdk';

import { Factory, Model, Response, RestSerializer, Server, createServer } from 'miragejs';
import { v4 } from 'uuid';

import { API_ROUTES, buildDownloadAppSettingFileRoute, buildGetFile } from '../../api/routes';
import { Database, LocalContext } from '../../types';
import { MOCK_SERVER_MEMBER, buildDatabase, buildMockLocalContext } from '../fixtures';
import { ExternalUrls } from '../types';

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
  buildUploadAppDataFilesRoute,
  buildPostChatBotRoute,
  buildPostAppSettingRoute,
} = API_ROUTES;

const ApplicationSerializer = RestSerializer.extend({
  root: false,
  embed: true,
});

const buildAppDataDownloadUrl = (id: string): string => `/download-app-data-url/${id}`;

export const mockMirageServer = ({
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
}): Server => {
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
  const currentMember: CompleteMember =
    currentMemberId === MOCK_SERVER_MEMBER.id
      ? MOCK_SERVER_MEMBER
      : MemberFactory({
          id: currentMemberId,
          name: 'current-member-name',
          email: 'memberId@email.com',
          extra: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          type: MemberType.Individual,
        });
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
        createdAt: () => new Date().toISOString(),
        updatedAt: () => new Date().toISOString(),
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
        createdAt: () => new Date().toISOString(),
        data: () => ({}),
        type: 'app-action-type',
      }),
      appSetting: Factory.extend<AppSetting>({
        id: () => v4(),
        data: () => ({}),
        createdAt: () => new Date().toISOString(),
        updatedAt: () => new Date().toISOString(),
        name: (idx) => `app-setting-${idx}`,
        item: currentItem,
        creator: currentMember,
      }),
      member: Factory.extend<CompleteMember>({
        id: () => v4(),
        extra: () => ({}),
        email: (idx) => `app-setting-email-${idx}`,
        name: (idx) => `member-${idx}`,
        createdAt: () => new Date().toISOString(),
        updatedAt: () => new Date().toISOString(),
        type: MemberType.Individual,
        enableSaveActions: true,
        isValidated: true,
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
      this.get(`/${buildGetAppDataRoute(currentItem.id)}`, (schema, request) => {
        const dataType = new URL(request.url).searchParams.get('type');
        return (
          schema.all('appDataResource').filter((x) => (dataType ? x.type === dataType : true)) ?? []
        );
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
          const localAppData = schema.findBy('appDataResource', { id });
          if (!localAppData) {
            return new Response(404, {}, { errors: ['not found'] });
          }
          localAppData.destroy();
          return localAppData.attrs;
        },
      );

      // app actions
      this.get(
        `/${buildGetAppActionsRoute(currentItem.id)}`,
        (schema) => schema.all('appActionResource') ?? [],
      );
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
      this.get(`/${buildGetAppSettingsRoute(currentItem.id)}`, (schema, request) => {
        const settingName = new URL(request.url).searchParams.get('name');
        return (
          schema.all('appSetting').filter((x) => (settingName ? x.name === settingName : true)) ??
          []
        );
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
      this.get(`/${buildDownloadAppSettingFileRoute(':id')}`, (schema: any, request) => {
        if (!currentMember) {
          return new Response(401, {}, { errors: ['user not authenticated'] });
        }

        const { id } = request.params;
        const a = schema.findBy('appSetting', { id });
        if (!a) {
          return new Response(404, {}, { errors: ['not found'] });
        }

        return a.attrs.data.fileUrl;
      });
      this.get(`/${buildGetFile(':url')}`, (schema, request) => {
        const { url } = request.params;

        if (url.includes('.pdf')) {
          // Simulate a PDF file response
          const pdfData = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]); // This represents '%PDF-' (start of a PDF file)
          return new Response(
            200,
            { 'Content-Type': 'application/pdf' }, // Set correct MIME type
            pdfData.buffer, // Return the simulated binary data for the PDF
          );
        }

        if (url.includes('.png')) {
          // Simulate a PNG file response
          const pngData = new Uint8Array([
            0x89,
            0x50,
            0x4e,
            0x47,
            0x0d,
            0x0a,
            0x1a,
            0x0a, // PNG file signature
            0x00,
            0x00,
            0x00,
            0x0d,
            0x49,
            0x48,
            0x44,
            0x52, // IHDR chunk
          ]);
          return new Response(
            200,
            { 'Content-Type': 'image/png' }, // Set correct MIME type
            pngData.buffer, // Return the simulated binary data for the PDF
          );
        }

        return new Response(404, {}, { errors: ['not found'] });
      });

      // context
      this.get(`/${buildGetContextRoute(currentItem.id)}`, (schema) =>
        // todo: complete returned data
        ({
          members: schema.all('member').models,
        }),
      );

      // files
      // needs double mock redirection for download file
      this.get(`/${buildDownloadAppDataFileRoute(':id')}`, (schema, request) => {
        const { id } = request.params;
        // this call returns the app data itself for simplification
        return buildAppDataDownloadUrl(id);
      });
      this.get(`/${buildAppDataDownloadUrl(':id')}`, (schema, request) => {
        const { id } = request.params;
        const localAppData = schema.findBy('appDataResource', { id });
        // this call returns the app data itself for simplification
        // bug: this is supposed to be a blob
        return localAppData;
      });

      this.post(
        `/${buildUploadAppDataFilesRoute(currentItem.id)})`,
        // eslint-disable-next-line arrow-body-style
        (schema) => {
          // const appData: Partial<AppData> = {
          //   data: {},
          //   itemId: currentItemId,
          //   memberId: currentMemberId,
          // }
          return schema.create('appDataResource');
        },
      );

      // OpenAI routes
      this.post(`/${buildPostChatBotRoute(currentItem.id)}`, () => ({
        completion: 'Biip boop i am a bot',
      }));

      // passthrough external urls
      externalUrls.forEach((url) => {
        this.passthrough(url);
      });
    },
  });
};
