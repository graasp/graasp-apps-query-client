import { UUID } from '@graasp/sdk';

export const buildAppDataKey = (id?: UUID) => ['app-data', id] as const;
export const buildAppActionsKey = (id?: UUID) => ['app-action', id] as const;
export const buildAppSettingsKey = (id?: UUID) => ['app-setting', id] as const;
export const buildAppContextKey = (id?: UUID) => ['context', id] as const;
export const AUTH_TOKEN_KEY = ['AUTH_TOKEN_KEY'];
export const LOCAL_CONTEXT_KEY = ['LOCAL_CONTEXT_KEY'];
export const buildFileContentKey = (id?: UUID) => ['app-data', 'files', 'content', id] as const;
export const buildAppSettingFileContentKey = (id?: UUID) =>
  ['app-setting', 'files', 'content', id] as const;

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
  buildAppSettingsKey,
};
