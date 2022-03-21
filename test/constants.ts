import { v4 } from 'uuid';
import { AppData, AppSetting, Member } from '../src/types';

export const API_HOST = 'http://localhost:3000';
export const UNAUTHORIZED_RESPONSE = { some: 'error' };

export const MEMBER_RESPONSE: Member = {
  id: '42',
  name: 'username',
  email: 'username@graasp.org',
  extra: {
    recycleBin: {
      itemId: 'recycleBinId',
    },
  },
};

export const MEMBERS_RESPONSE: Member[] = [
  MEMBER_RESPONSE,
  {
    id: '421',
    name: 'username1',
    email: 'username1@graasp.org',
    extra: {},
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

export const buildAppData = (
  { id, data }: { id: string; data: unknown } = { id: v4(), data: {} },
) => ({
  id,
  data,
  type: 'verb',
});

export const FIXTURE_APP_DATA: AppData[] = [buildAppData(), buildAppData(), buildAppData()];

export const buildAppSetting = (
  { id, data }: { id: string; data: unknown } = { id: v4(), data: {} },
) => ({
  id,
  data,
  name: 'app-setting-name',
});

export const FIXTURE_APP_SETTINGS: AppSetting[] = [
  buildAppSetting(),
  buildAppSetting(),
  buildAppSetting(),
];

export const FIXTURE_TOKEN = 'some-token';
export const FIXTURE_CONTEXT = {
  members: MEMBERS_RESPONSE,
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
}: { itemId?: string | null; memberId?: string | null } = {}) => ({
  apiHost: API_HOST,
  itemId,
  memberId,
  settings: {},
});
export const MOCK_APP_ORIGIN = 'http://localhost';
