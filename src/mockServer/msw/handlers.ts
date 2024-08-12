import {
  AppAction,
  AppData,
  AppDataVisibility,
  AppSetting,
  DiscriminatedItem,
  Member,
  PermissionLevel,
} from '@graasp/sdk';

import { RestHandler, rest } from 'msw';
import { v4 } from 'uuid';

import { API_ROUTES, buildGetFile } from '../../api/routes';
import { Database, LocalContext, MockAppSetting } from '../../types';
import { AppMocks } from './dexie-db';

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
  const memberId = bearer.split(' ').at(-1);
  if (!memberId) {
    throw new Error('Unable to extract memberId from token');
  }
  return memberId;
};

export const buildMSWMocks = (
  appContext: LocalContext,
  database?: Database,
  dbName?: string,
): { handlers: RestHandler[]; db: AppMocks } => {
  const { apiHost } = appContext;
  const db = new AppMocks(dbName);

  const getPermissionForMember = async (memberId: string): Promise<PermissionLevel> => {
    const localContextForMember = await db.appContext.get(memberId);
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

  const getMemberFromId = async (memberId: string): Promise<Member> => {
    const member = await db.member.where('id').equals(memberId).first();
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
    rest.get(`${apiHost}/${buildGetAppDataRoute(':itemId')}`, async (req, res, ctx) => {
      const reqItemId = req.params.itemId;
      const dataType = new URL(req.url).searchParams.get('type');

      const memberId = getMemberIdFromToken(req.headers.get('Authorization'));
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
            return x.creator?.id === memberId || x.member.id === memberId;
          })
          // filter the app data by type if specified
          .and((x) => (dataType ? x.type === dataType : true))
          .toArray();
      }

      return res(ctx.status(200), ctx.json(value));
    }),

    // POST /app-items/:itemId/app-data
    rest.post(
      `${apiHost}/${buildPostAppDataRoute({ itemId: ':itemId' })}`,
      async (req, res, ctx) => {
        const reqItemId = req.params.itemId;
        const item = await getItemFromId(reqItemId as string);
        const memberId = getMemberIdFromToken(req.headers.get('Authorization'));
        const member = await getMemberFromId(memberId);

        const body: Pick<AppData, 'data' | 'type'> & {
          visibility?: AppData['visibility'];
        } = await req.json();

        const appData: AppData = {
          id: v4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          item,
          creator: member,
          member,
          visibility: AppDataVisibility.Member,
          ...body,
        };
        const newId = await db.appData.add(appData);
        const value = await db.appData.get(newId);

        return res(ctx.status(200), ctx.json(value));
      },
    ),

    // PATCH /app-items/:itemId/app-data/:id
    rest.patch(
      `${apiHost}/${buildPatchAppDataRoute({ itemId: ':itemId', id: ':id' })}`,
      async (req, res, ctx) => {
        const { id } = req.params;

        const body: Pick<AppData, 'data' | 'id'> & {
          visibility?: AppData['visibility'];
        } = await req.json();

        const appData: Partial<AppData> = {
          updatedAt: new Date().toISOString(),
          ...body,
        };
        await db.appData.update(id as string, appData);
        const value = await db.appData.get(id as string);

        return res(ctx.status(200), ctx.json(value));
      },
    ),

    // DELETE /app-items/:itemId/app-data/:id
    rest.delete(
      `${apiHost}/${buildDeleteAppDataRoute({ itemId: ':itemId', id: ':id' })}`,
      async (req, res, ctx) => {
        const { id } = req.params;

        const value = await db.appData.get(id as string);
        await db.appData.delete(id as string);

        return res(ctx.status(200), ctx.json(value));
      },
    ),

    // *************************
    //       App Settings
    // *************************

    // GET /app-items/:itemId/app-settings
    rest.get(`${apiHost}/${buildGetAppSettingsRoute(':itemId')}`, async (req, res, ctx) => {
      const reqItemId = req.params.itemId;

      const url = new URL(req.url);
      const settingName = url.searchParams.get('name');

      const value = await db.appSetting
        .where('item.id')
        .equals(reqItemId)
        // filter settings and return only setting with the given name if parameter was set otherwise return everything
        .and((x) => (settingName ? x.name === settingName : true))
        .toArray();
      return res(ctx.status(200), ctx.json(value));
    }),

    // POST /app-items/:itemId/app-settings
    rest.post(
      `${apiHost}/${buildPostAppSettingRoute({ itemId: ':itemId' })}`,
      async (req, res, ctx) => {
        const reqItemId = req.params.itemId;
        const item = await getItemFromId(reqItemId as string);
        const memberId = getMemberIdFromToken(req.headers.get('Authorization'));
        const member = await getMemberFromId(memberId);
        const permission = await getPermissionForMember(memberId);

        // when member is not an admin -> return an error
        if (PermissionLevel.Admin !== permission) {
          return res(ctx.status(403), ctx.json({ message: 'member can not admin' }));
        }

        const body: Pick<AppSetting, 'data' | 'name'> = await req.json();
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

        return res(ctx.status(200), ctx.json(value));
      },
    ),

    // PATCH /app-items/:itemId/app-settings/:id
    rest.patch(
      `${apiHost}/${buildPatchAppSettingRoute({
        itemId: ':itemId',
        id: ':id',
      })}`,
      async (req, res, ctx) => {
        const { id } = req.params;

        const memberId = getMemberIdFromToken(req.headers.get('Authorization'));
        const permission = await getPermissionForMember(memberId);

        // when member is not an admin -> return an error
        if (PermissionLevel.Admin !== permission) {
          return res(ctx.status(403), ctx.json({ message: 'member can not admin' }));
        }

        const body: Pick<AppSetting, 'data' | 'id'> = await req.json();
        const appSetting: Partial<MockAppSetting> = {
          updatedAt: new Date().toISOString(),
          ...body,
        };
        await db.appSetting.update(id as string, appSetting);
        const value = await db.appSetting.get(id as string);

        return res(ctx.status(200), ctx.json(value));
      },
    ),

    // DELETE /app-items/:itemId/app-setting/:id
    rest.delete(
      `${apiHost}/${buildDeleteAppSettingRoute({
        itemId: ':itemId',
        id: ':id',
      })}`,
      async (req, res, ctx) => {
        const { id } = req.params;

        const memberId = getMemberIdFromToken(req.headers.get('Authorization'));
        const permission = await getPermissionForMember(memberId);

        // when member is not an admin -> return an error
        if (PermissionLevel.Admin !== permission) {
          return res(ctx.status(403), ctx.json({ message: 'member can not admin' }));
        }

        const value = await db.appSetting.get(id as string);
        await db.appSetting.delete(id as string);

        return res(ctx.status(200), ctx.json(value));
      },
    ),

    // GET /app-items/app-settings/:appSettingId/download
    rest.get(
      `${apiHost}/${buildDownloadAppSettingFileRoute(':appSettingId')}`,
      async (req, res, ctx) => {
        const reqItemId = req.params.appSettingId;

        const value = await db.appSetting.get(reqItemId as string);
        const url = value?.data?.fileUrl; // assume that we have fileUrl within data setting

        if (!url) {
          // Handle the case where the URL is not found
          return res(ctx.status(404), ctx.json({ error: 'URL not found' }));
        }

        return res(ctx.status(200), ctx.text(url as string));
      },
    ),
    // GET /app-items/app-settings/:appSettingId/download
    rest.get(
      `${apiHost}/${buildDownloadAppSettingFileRoute(':appSettingId')}`,
      async (req, res, ctx) => {
        const reqItemId = req.params.appSettingId;

        const value = await db.appSetting.get(reqItemId as string);
        const url = value?.data?.fileUrl; // assume that we have fileUrl within data setting

        if (!url) {
          // Handle the case where the URL is not found
          return res(ctx.status(404), ctx.json({ error: 'URL not found' }));
        }

        return res(ctx.status(200), ctx.text(url as string));
      },
    ),

    // GET /app-items/app-settings/:fileUrl
    rest.get(`${apiHost}/${buildGetFile(':fileURL')}`, async (req, res, ctx) => {
      const fileURL = req.params.fileURL;

      if (fileURL.includes('.pdf')) {
        // Simulate a PDF file response
        const pdfData = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]); // This represents '%PDF-' (start of a PDF file)
        return res(
          ctx.status(200),
          ctx.set('Content-Type', 'application/pdf'), // MIME type for PDF
          ctx.body(pdfData.buffer), // Return the simulated binary data for the PDF
        );
      }

      if (fileURL.includes('.png')) {
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
        return res(
          ctx.status(200),
          ctx.set('Content-Type', 'image/png'), // MIME type for PNG
          ctx.body(pngData.buffer), // Return the simulated binary data for the PNG
        );
      }
      return res(ctx.status(404), ctx.json({ error: 'File not found or unsupported file type' }));
    }),

    // *************************
    //       App Action
    // *************************

    // GET /app-items/:itemId/app-action
    rest.get(`${apiHost}/${buildGetAppActionsRoute(':itemId')}`, async (req, res, ctx) => {
      const memberId = getMemberIdFromToken(req.headers.get('Authorization'));
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
      return res(ctx.status(200), ctx.json(value));
    }),

    // POST /app-items/:itemId/app-action
    rest.post(
      `${apiHost}/${buildPostAppActionRoute({ itemId: ':itemId' })}`,
      async (req, res, ctx) => {
        const reqItemId = req.params.itemId;
        const item = await getItemFromId(reqItemId as string);
        const memberId = getMemberIdFromToken(req.headers.get('Authorization'));
        const member = await getMemberFromId(memberId);

        const body: Pick<AppAction, 'data' | 'type'> = await req.json();
        const appAction: AppAction = {
          id: v4(),
          createdAt: new Date().toISOString(),
          item,
          member,
          ...body,
        };
        const value = await db.appAction.add(appAction);

        return res(ctx.status(200), ctx.json(value));
      },
    ),

    // *************************
    //       App Context
    // *************************
    // /app-items/:itemId/context
    rest.get(`${apiHost}/${buildGetContextRoute(':itemId')}`, async (req, res, ctx) => {
      const { itemId: reqItemId } = req.params;
      const value = {
        members: await db.member.toArray(),
        ...(await db.item.get(reqItemId as string)),
      };

      return res(ctx.status(200), ctx.json(value));
    }),

    // *************************
    //       Chatbot
    // *************************
    // /app-items/:itemId/chat-bot
    rest.post(`${apiHost}/${buildPostChatBotRoute(':itemId')}`, async (_req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({ completion: 'biiip boop I am a chatbot', model: 'fake-gpt' }),
      ),
    ),

    // plumbing
    rest.delete('/__mocks/reset', (_req, res, ctx) => {
      db.resetDB({ ...database, appContext });
      return res(ctx.status(200));
    }),
    rest.post('/__mocks/seed', async (req, res, ctx) => {
      const seedData = await req.json();
      db.resetDB(seedData);
      return res(ctx.status(200));
    }),
    rest.get('/__mocks/context', async (req, res, ctx) => {
      const memberId = getMemberIdFromToken(req.headers.get('Authorization'));
      const value = await db.appContext.where('memberId').equals(memberId).first();
      return res(ctx.status(200), ctx.json(value));
    }),
    rest.post('/__mocks/context', async (req, res, ctx) => {
      const memberId = getMemberIdFromToken(req.headers.get('Authorization'));
      const body: Partial<LocalContext> = await req.json();
      await db.appContext.update(memberId, body);

      const value = await db.appContext.where('memberId').equals(memberId).first();
      return res(ctx.status(200), ctx.json(value));
    }),
  ];

  return { handlers, db };
};
