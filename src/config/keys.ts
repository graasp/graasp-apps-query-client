import { UUID } from '@graasp/sdk';

const APP_SETTING_KEY = 'app-setting';
export const buildAppDataKey = (id?: UUID) => ['app-data', id] as const;
export const buildAppActionsKey = (id?: UUID) => ['app-action', id] as const;
export const appSettingKeys = {
  all: [APP_SETTING_KEY] as const,
  single: () => [...appSettingKeys.all, 'single'] as const,
  singleId: (id?: UUID, filters?: { [key: string]: unknown }) =>
    [...appSettingKeys.single(), id, filters] as const,
  fileContent: () => [...appSettingKeys.all, 'file-content'] as const,
  fileContentId: (id?: UUID) => [...appSettingKeys.fileContent(), id] as const,
};

export const buildAppContextKey = (id?: UUID) => ['context', id] as const;
export const AUTH_TOKEN_KEY = ['AUTH_TOKEN_KEY'];
export const LOCAL_CONTEXT_KEY = ['LOCAL_CONTEXT_KEY'];
export const buildFileContentKey = (id?: UUID) => ['app-data', 'files', 'content', id] as const;

export const buildPostMessageKeys = (itemId: UUID) =>
  ({
    GET_CONTEXT_SUCCESS: `GET_CONTEXT_SUCCESS_${itemId}`,
    GET_CONTEXT_FAILURE: `GET_CONTEXT_FAILURE_${itemId}`,
    GET_CONTEXT: `GET_CONTEXT_${itemId}`,
    GET_AUTH_TOKEN: `GET_AUTH_TOKEN_${itemId}`,
    GET_AUTH_TOKEN_SUCCESS: `GET_AUTH_TOKEN_SUCCESS_${itemId}`,
    GET_AUTH_TOKEN_FAILURE: `GET_AUTH_TOKEN_FAILURE_${itemId}`,
    POST_AUTO_RESIZE: `POST_AUTO_RESIZE_${itemId}`,
  }) as const;

export const QUERY_KEYS = {
  buildAppDataKey,
  buildAppContextKey,
  buildAppActionsKey,
  appSettingKeys,
};
