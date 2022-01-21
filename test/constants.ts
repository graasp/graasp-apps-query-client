import { Member } from '../src/types';

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
