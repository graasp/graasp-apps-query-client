import { UUID } from '@graasp/sdk';

const APP_SETTING_KEY = 'app-setting';
const APP_DATA_KEY = 'app-data';
const APP_ACTION_KEY = 'app-action';

export const appSettingKeys = {
  all: [APP_SETTING_KEY] as const,
  allSingles: () => [...appSettingKeys.all, 'single'] as const,
  single: (id?: UUID, filters?: { [key: string]: unknown }) =>
    [...appSettingKeys.allSingles(), id, filters] as const,
  allFileContents: () => [...appSettingKeys.all, 'file-content'] as const,
  fileContent: (id?: UUID) => [...appSettingKeys.allFileContents(), id] as const,
};

export const appDataKeys = {
  all: [APP_DATA_KEY] as const,
  allSingles: () => [...appDataKeys.all, 'single'] as const,
  single: (id?: UUID, filters?: { [key: string]: unknown }) =>
    [...appDataKeys.allSingles(), id, filters] as const,
  allFileContents: () => [...appDataKeys.all, 'file-content'] as const,
  fileContent: (id?: UUID) => [...appDataKeys.allFileContents(), id] as const,
};

export const appActionKeys = {
  all: [APP_ACTION_KEY] as const,
  allSingles: () => [...appActionKeys.all, 'single'] as const,
  single: (id?: UUID) => [...appActionKeys.allSingles(), id] as const,
};

export const AUTH_TOKEN_KEY = ['AUTH_TOKEN_KEY'];
export const LOCAL_CONTEXT_KEY = ['LOCAL_CONTEXT_KEY'];

export const buildAppContextKey = (id?: UUID) => ['context', id] as const;

export const buildPostMessageKeys = (itemId: UUID) =>
  ({
    GET_CONTEXT_SUCCESS: `GET_CONTEXT_SUCCESS_${itemId}`,
    GET_CONTEXT_FAILURE: `GET_CONTEXT_FAILURE_${itemId}`,
    GET_CONTEXT: `GET_CONTEXT_${itemId}`,
    GET_AUTH_TOKEN: `GET_AUTH_TOKEN_${itemId}`,
    GET_AUTH_TOKEN_SUCCESS: `GET_AUTH_TOKEN_SUCCESS_${itemId}`,
    GET_AUTH_TOKEN_FAILURE: `GET_AUTH_TOKEN_FAILURE_${itemId}`,
    POST_AUTO_RESIZE: `POST_AUTO_RESIZE_${itemId}`,
    POST_MAX_RESIZE: `POST_MAX_RESIZE_${itemId}`,
  }) as const;

export const QUERY_KEYS = {
  buildAppContextKey,
  appSettingKeys,
  appDataKeys,
  appActionKeys,
};
