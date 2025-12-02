import {
  AppAction,
  AppData,
  AppDataVisibility,
  AppSetting,
  DiscriminatedItem,
  LocalContext,
  Member,
  PermissionLevel,
  PermissionLevelOptions,
} from '@graasp/sdk';

import { HttpResponse, RequestHandler, delay, http } from 'msw';
import { v4 } from 'uuid';

import { API_ROUTES, buildUploadAppSettingFilesRoute } from '../../api/routes.js';
import { Database, MockAppSetting } from '../../types.js';
import { AppMocks } from './dexie-db.js';

const {
  buildGetAppDataRoute,
  buildGetContextRoute,
  buildPostAppDataRoute,
  buildPatchAppDataRoute,
  buildDeleteAppDataRoute,
  buildDeleteAppSettingRoute,
  // todo: implement mock file upload
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildDownloadAppDataFileRoute,
  buildDownloadAppSettingFileRoute,
  buildGetAppActionsRoute,
  buildGetAppSettingsRoute,
  buildPatchAppSettingRoute,
  buildPostAppActionRoute,
  buildPostAppSettingRoute,
  buildPostChatBotRoute,
} = API_ROUTES;

const getMemberIdFromToken = (bearer: string | null): string => {
  if (!bearer) {
    throw new Error('no bearer token');
  }
  const accountId = bearer.split(' ').at(-1);
  if (!accountId) {
    throw new Error('Unable to extract memberId from token');
  }
  return accountId;
};

export const buildMSWMocks = (
  appContext: LocalContext,
  database?: Database,
  dbName?: string,
): { handlers: RequestHandler[]; db: AppMocks } => {
  const { apiHost } = appContext;
  const db = new AppMocks(dbName);

  const buildAppSettingDownloadUrl = (id: string): string =>
    `${apiHost}/download-app-setting-url/${id}`;

  const getPermissionForMember = async (accountId: string): Promise<PermissionLevelOptions> => {
    const localContextForMember = await db.appContext.get(accountId);
    if (!localContextForMember) {
      throw new Error('Member was not found in localContext database');
    }
    const { permission } = localContextForMember;
    return permission;
  };

  const getItemFromId = async (itemId: string): Promise<DiscriminatedItem> => {
    const item = await db.item.where('id').equals(itemId).first();
    if (!item) {
      throw new Error('Item was not found in items database');
    }
    return item;
  };

  const getMemberFromId = async (accountId: string): Promise<Member> => {
    const member = await db.member.where('id').equals(accountId).first();
    if (!member) {
      throw new Error('Item was not found in items database');
    }
    return member;
  };

  const handlers = [
    // *************************
    //       App Data
    // *************************

    // GET /app-items/:itemId/app-data
    http.get(`${apiHost}/${buildGetAppDataRoute(':itemId')}`, async ({ params, request }) => {
      const reqItemId = params.itemId;

      if (!reqItemId) {
        return HttpResponse.error();
      }
      const dataType = new URL(request.url).searchParams.get('type');

      const memberId = getMemberIdFromToken(request.headers.get('Authorization'));
      const permission = await getPermissionForMember(memberId);
      let value;
      if (permission === PermissionLevel.Admin) {
        // return all app data of the item
        value = await db.appData
          .where('item.id')
          .equals(reqItemId)
          // filter app data and return only app data with the given type if parameter was set otherwise return everything
          .and((x) => (dataType ? x.type === dataType : true))
          .toArray();
      } else {
        value = await db.appData
          .where('item.id')
          .equals(reqItemId)
          .and((x) => {
            // app data with visibility item should be returned to anyone
            if (x.visibility === AppDataVisibility.Item) {
              return true;
            }
            // if app data is not "visibility item" only return app data that were created by the member or addressed to him
            return x.creator?.id === memberId || x.account.id === memberId;
          })
          // filter the app data by type if specified
          .and((x) => (dataType ? x.type === dataType : true))
          .toArray();
      }

      return HttpResponse.json(value);
    }),

    // POST /app-items/:itemId/app-data
    http.post(
      `${apiHost}/${buildPostAppDataRoute({ itemId: ':itemId' })}`,
      async ({ request, params }) => {
        const reqItemId = params.itemId;
        const item = await getItemFromId(reqItemId as string);
        const memberId = getMemberIdFromToken(request.headers.get('Authorization'));
        const account = await getMemberFromId(memberId);

        const body = (await request.json()) as Pick<AppData, 'data' | 'type'> & {
          visibility?: AppData['visibility'];
        };

        const appData: AppData = {
          id: v4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          item,
          creator: account,
          account,
          visibility: AppDataVisibility.Member,
          ...body,
        };
        const newId = await db.appData.add(appData);
        const value = await db.appData.get(newId);

        return HttpResponse.json(value);
      },
    ),

    // PATCH /app-items/:itemId/app-data/:id
    http.patch(
      `${apiHost}/${buildPatchAppDataRoute({ itemId: ':itemId', id: ':id' })}`,
      async ({ params, request }) => {
        const { id } = params;

        const body = (await request.json()) as Pick<AppData, 'data' | 'id'> & {
          visibility?: AppData['visibility'];
        };

        const appData: Partial<AppData> = {
          updatedAt: new Date().toISOString(),
          ...body,
        };
        await db.appData.update(id as string, appData);
        const value = await db.appData.get(id as string);

        return HttpResponse.json(value);
      },
    ),

    // DELETE /app-items/:itemId/app-data/:id
    http.delete(
      `${apiHost}/${buildDeleteAppDataRoute({ itemId: ':itemId', id: ':id' })}`,
      async ({ params }) => {
        const { id } = params;

        const value = await db.appData.get(id as string);
        await db.appData.delete(id as string);

        return HttpResponse.json(value);
      },
    ),

    // *************************
    //       App Settings
    // *************************

    // GET /app-items/:itemId/app-settings
    http.get(`${apiHost}/${buildGetAppSettingsRoute(':itemId')}`, async ({ params, request }) => {
      const reqItemId = params.itemId;

      if (!reqItemId) {
        return HttpResponse.error();
      }

      const url = new URL(request.url);
      const settingName = url.searchParams.get('name');

      const value = await db.appSetting
        .where('item.id')
        .equals(reqItemId)
        // filter settings and return only setting with the given name if parameter was set otherwise return everything
        .and((x) => (settingName ? x.name === settingName : true))
        .toArray();
      return HttpResponse.json(value);
    }),

    // POST /app-items/:itemId/app-settings
    http.post(
      `${apiHost}/${buildPostAppSettingRoute({ itemId: ':itemId' })}`,
      async ({ params, request }) => {
        const reqItemId = params.itemId;
        const item = await getItemFromId(reqItemId as string);
        const memberId = getMemberIdFromToken(request.headers.get('Authorization'));
        const member = await getMemberFromId(memberId);
        const permission = await getPermissionForMember(memberId);

        // when member is not an admin -> return an error
        if (PermissionLevel.Admin !== permission) {
          return new HttpResponse('member can not admin', { status: 403 });
        }

        const body = (await request.json()) as Pick<AppSetting, 'data' | 'name'>;
        const appSetting: AppSetting = {
          id: v4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          item,
          creator: member,
          ...body,
        };
        const newId = await db.appSetting.add(appSetting);
        const value = await db.appSetting.get(newId);

        return HttpResponse.json(value);
      },
    ),

    // PATCH /app-items/:itemId/app-settings/:id
    http.patch(
      `${apiHost}/${buildPatchAppSettingRoute({
        itemId: ':itemId',
        id: ':id',
      })}`,
      async ({ params, request }) => {
        const { id } = params;

        const memberId = getMemberIdFromToken(request.headers.get('Authorization'));
        const permission = await getPermissionForMember(memberId);

        // when member is not an admin -> return an error
        if (PermissionLevel.Admin !== permission) {
          return new HttpResponse('member can not admin', { status: 403 });
        }

        const body = (await request.json()) as Pick<AppSetting, 'data' | 'id'>;
        const appSetting: Partial<MockAppSetting> = {
          updatedAt: new Date().toISOString(),
          ...body,
        };
        await db.appSetting.update(id as string, appSetting);
        const value = await db.appSetting.get(id as string);

        return HttpResponse.json(value);
      },
    ),

    // DELETE /app-items/:itemId/app-setting/:id
    http.delete(
      `${apiHost}/${buildDeleteAppSettingRoute({
        itemId: ':itemId',
        id: ':id',
      })}`,
      async ({ params, request }) => {
        const { id } = params;

        const memberId = getMemberIdFromToken(request.headers.get('Authorization'));
        const permission = await getPermissionForMember(memberId);

        // when member is not an admin -> return an error
        if (PermissionLevel.Admin !== permission) {
          return new HttpResponse('member can not admin', { status: 403 });
        }

        const value = await db.appSetting.get(id as string);
        await db.appSetting.delete(id as string);

        return HttpResponse.json(value);
      },
    ),

    // mock upload file
    http.post(`${apiHost}/${buildUploadAppSettingFilesRoute(':id')}`, async ({ request }) => {
      const url = new URL(request.url);
      const itemId = url.searchParams.get('id');

      const data = await request.formData();
      const file = data.get('file');

      if (!file) {
        return new HttpResponse('Missing document', { status: 400 });
      }

      if (!(file instanceof File)) {
        return new HttpResponse('Uploaded document is not a File', {
          status: 400,
        });
      }

      const item = await getItemFromId(itemId as string);
      const memberId = getMemberIdFromToken(request.headers.get('Authorization'));
      const member = await getMemberFromId(memberId);
      const permission = await getPermissionForMember(memberId);

      // when member is not an admin -> return an error
      if (PermissionLevel.Admin !== permission) {
        return new HttpResponse('member can not admin', { status: 403 });
      }

      const appSettingId = v4();
      const path = `apps/app-setting/${item.id}/${appSettingId}`;
      const appSetting: AppSetting = {
        id: appSettingId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        item,
        creator: member,
        name: 'file',
        data: {
          path,
        },
      };
      const newId = await db.appSetting.add(appSetting);
      const value = await db.appSetting.get(newId);

      // save the file in the mocked database
      await db.uploadedFiles.add({ id: appSettingId, file });

      return HttpResponse.json(value);
    }),
    // GET /app-items/app-settings/:appSettingId/download
    http.get(
      `${apiHost}/${buildDownloadAppSettingFileRoute(':appSettingId')}`,
      async ({ params }) => {
        const { appSettingId } = params;
        const url = buildAppSettingDownloadUrl(appSettingId as string);

        return HttpResponse.text(url);
      },
    ),
    // GET /download-app-setting-url/:id
    http.get(`${buildAppSettingDownloadUrl(':appSettingId')}`, async ({ params }) => {
      const { appSettingId } = params;

      try {
        // retrieve the file from the mocked db (in prod, it's retrieving the path on AWS)
        const res = await db.uploadedFiles.get(appSettingId as string);
        if (!res) {
          throw new Error('The file was not found');
        }

        return new HttpResponse(res.file);
      } catch (e) {
        console.error(e);
        return HttpResponse.json({ error: 'file not found' }, { status: 404 });
      }
    }),

    // *************************
    //       App Action
    // *************************

    // GET /app-items/:itemId/app-action
    http.get(`${apiHost}/${buildGetAppActionsRoute(':itemId')}`, async ({ request }) => {
      const memberId = getMemberIdFromToken(request.headers.get('Authorization'));
      const permission = await getPermissionForMember(memberId);
      let value;
      switch (permission) {
        case PermissionLevel.Admin:
          // get all actions when admin
          value = await db.appAction.toArray();
          break;
        case PermissionLevel.Write:
        case PermissionLevel.Read:
        default:
          // get only own actions
          value = await db.appAction.where('memberId').equals(memberId).toArray();
          break;
      }
      return HttpResponse.json(value);
    }),

    // POST /app-items/:itemId/app-action
    http.post(
      `${apiHost}/${buildPostAppActionRoute({ itemId: ':itemId' })}`,
      async ({ params, request }) => {
        const reqItemId = params.itemId;
        const item = await getItemFromId(reqItemId as string);
        const memberId = getMemberIdFromToken(request.headers.get('Authorization'));
        const account = await getMemberFromId(memberId);

        const body = (await request.json()) as Pick<AppAction, 'data' | 'type'>;
        const appAction: AppAction = {
          id: v4(),
          createdAt: new Date().toISOString(),
          item,
          account,
          ...body,
        };
        const value = await db.appAction.add(appAction);

        return HttpResponse.json(value);
      },
    ),

    // *************************
    //       App Context
    // *************************
    // /app-items/:itemId/context
    http.get(`${apiHost}/${buildGetContextRoute(':itemId')}`, async ({ params }) => {
      const { itemId: reqItemId } = params;
      const value = {
        members: await db.member.toArray(),
        item: await db.item.get(reqItemId as string),
      };

      return HttpResponse.json(value);
    }),

    // *************************
    //       Chatbot
    // *************************
    // /app-items/:itemId/chat-bot
    http.post(`${apiHost}/${buildPostChatBotRoute(':itemId')}`, async () => {
      // adds a delay for realistic use cases
      await delay(5000);

      return HttpResponse.json({
        completion: 'biiip boop I am a chatbot',
        model: 'fake-gpt',
      });
    }),

    // plumbing
    http.delete('/__mocks/reset', () => {
      db.resetDB({ ...database, appContext });
      return new HttpResponse();
    }),
    http.post('/__mocks/seed', async ({ request }) => {
      const seedData = (await request.json()) as { data?: Partial<Database> } & {
        appContext?: LocalContext;
      };
      db.resetDB(seedData);
      return new HttpResponse();
    }),
    http.get('/__mocks/context', async ({ request }) => {
      const memberId = getMemberIdFromToken(request.headers.get('Authorization'));
      const value = await db.appContext.where('memberId').equals(memberId).first();
      return HttpResponse.json(value);
    }),
    http.post('/__mocks/context', async ({ request }) => {
      const memberId = getMemberIdFromToken(request.headers.get('Authorization'));
      const body = (await request.json()) as Partial<LocalContext>;
      await db.appContext.update(memberId, body);

      const value = await db.appContext.where('memberId').equals(memberId).first();
      return HttpResponse.json(value);
    }),
  ];

  return { handlers, db };
};
