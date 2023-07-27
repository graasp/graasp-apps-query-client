import { v4 } from 'uuid';
import { LocalContext } from '../src/types';
import {
  AppData,
  AppDataVisibility,
  AppSetting,
  FolderItemType,
  ItemType,
  Member,
  MemberType,
} from '@graasp/sdk';

export const API_HOST = 'http://localhost:3000';
export const WS_HOST = 'ws://localhost:3000';
export const DOMAIN = 'domain';
export const UNAUTHORIZED_RESPONSE = { some: 'error' };

export const MEMBER_RESPONSE: Member = {
  id: '42',
  name: 'username',
  type: MemberType.Individual,
  email: 'username@graasp.org',
  extra: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const MEMBERS_RESPONSE: Member[] = [
  MEMBER_RESPONSE,
  {
    id: '421',
    name: 'username1',
    email: 'username1@graasp.org',
    type: MemberType.Individual,
    extra: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
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

export const MOCK_ITEM: FolderItemType = {
  description: '',
  type: ItemType.FOLDER,
  extra: { [ItemType.FOLDER]: { childrenOrder: [] } },
  id: '123',
  name: '',
  path: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  creator: MEMBER_RESPONSE,
  settings: {},
};

export const buildAppData = ({ id = v4(), data = {} }: Partial<AppData> = {}): AppData => ({
  id,
  data,
  type: 'type',
  creator: MEMBER_RESPONSE,
  createdAt: new Date(),
  updatedAt: new Date(),
  member: MEMBER_RESPONSE,
  item: MOCK_ITEM,
  visibility: AppDataVisibility.Member,
});

export const FIXTURE_APP_DATA: AppData[] = [buildAppData(), buildAppData(), buildAppData()];

export const buildAppSetting = ({
  id = v4(),
  data = {},
}: Partial<AppSetting> = {}): AppSetting => ({
  id,
  data,
  name: 'app-setting-name',
  createdAt: new Date(),
  updatedAt: new Date(),
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

export enum REQUEST_METHODS {
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE',
  PUT = 'PUT',
  PATCH = 'PATCH',
}

export const buildMockLocalContext = ({
  itemId = v4(),
  memberId = v4(),
}: Partial<LocalContext> = {}) => ({
  apiHost: API_HOST,
  itemId,
  memberId,
  settings: {},
});

export const MOCK_APP_ORIGIN = 'http://localhost';
