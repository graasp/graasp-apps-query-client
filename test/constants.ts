import {
  AccountType,
  AppAction,
  AppData,
  AppDataVisibility,
  AppSetting,
  CompleteMember,
  Context,
  FolderItemFactory,
  FolderItemType,
  ItemType,
  LocalContext,
  MemberFactory,
  PermissionLevel,
} from '@graasp/sdk';

import { v4 } from 'uuid';

export const API_HOST = 'http://localhost:3000';
export const WS_HOST = 'ws://localhost:3000';
export const DOMAIN = 'domain';
export const UNAUTHORIZED_RESPONSE = { some: 'error' };

export const MEMBER_RESPONSE: CompleteMember = MemberFactory({
  name: 'username',
  type: AccountType.Individual,
  email: 'username@graasp.org',
  extra: {},
});

export const MEMBERS_RESPONSE: CompleteMember[] = [
  MEMBER_RESPONSE,
  MemberFactory({
    name: 'username1',
    email: 'username1@graasp.org',
    type: AccountType.Individual,
    extra: {},
  }),
];

export const OK_RESPONSE = {};

const BlobMock = {
  blob: () => 'blob',
};

export const S3_FILE_BLOB_RESPONSE = BlobMock;
export const THUMBNAIL_BLOB_RESPONSE = BlobMock;
export const AVATAR_BLOB_RESPONSE = BlobMock;

export const APPS = [
  {
    name: 'Code App',
    url: 'http://codeapp.com',
    description: 'description',
    extra: {
      image: 'http://codeapp.com/logo.png',
    },
  },
  {
    name: 'File App',
    description: 'description',
    url: 'http://fileapp.com',
    extra: {
      image: 'http://fileapp.com/logo.png',
    },
  },
];

export const MOCK_ITEM: FolderItemType = FolderItemFactory({
  description: '',
  type: ItemType.FOLDER,
  extra: { [ItemType.FOLDER]: {} },
  id: '123',
  creator: MEMBER_RESPONSE,
});

export const buildAppData = ({ id = v4(), data = {} }: Partial<AppData> = {}): AppData => ({
  id,
  data,
  type: 'type',
  creator: MEMBER_RESPONSE,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  account: MEMBER_RESPONSE,
  item: MOCK_ITEM,
  visibility: AppDataVisibility.Member,
});

export const FIXTURE_APP_DATA: AppData[] = [buildAppData(), buildAppData(), buildAppData()];

export const buildAppAction = ({ id = v4(), data = {} }: Partial<AppAction> = {}): AppAction => ({
  id,
  data,
  type: 'action',
  createdAt: new Date().toISOString(),
  account: MEMBER_RESPONSE,
  item: MOCK_ITEM,
});

export const FIXTURE_APP_ACTIONS: AppAction[] = [
  buildAppAction({ data: { text: 'action 1' } }),
  buildAppAction({ data: { text: 'action 2' } }),
  buildAppAction({ data: { text: 'action 3' } }),
  buildAppAction({ data: { text: 'action 4' } }),
];

export const buildAppSetting = ({
  id = v4(),
  data = {},
}: Partial<AppSetting> = {}): AppSetting => ({
  id,
  data,
  name: 'app-setting-name',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  item: MOCK_ITEM,
  creator: MEMBER_RESPONSE,
});

export const FIXTURE_APP_SETTINGS: AppSetting[] = [
  buildAppSetting(),
  buildAppSetting(),
  buildAppSetting(),
];

export const FIXTURE_TOKEN = 'some-token';
export const FIXTURE_CONTEXT = {
  children: [],
  members: MEMBERS_RESPONSE,
  ...MOCK_ITEM,
};

export enum RequestMethods {
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE',
  PUT = 'PUT',
  PATCH = 'PATCH',
  OPTIONS = 'OPTIONS',
}

export const buildMockLocalContext = ({
  itemId = v4(),
  accountId = v4(),
}: Partial<LocalContext> = {}): LocalContext => ({
  apiHost: API_HOST,
  itemId,
  accountId,
  settings: {},
  mobile: false,
  context: Context.Builder,
  permission: PermissionLevel.Read,
});

export const MOCK_APP_ORIGIN = 'http://localhost';
export const GRAASP_APP_KEY = '1234';
