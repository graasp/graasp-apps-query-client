import { UUID } from '../types';

export const buildAppDataKey = (id?: UUID) => [id, 'app-data'];
export const buildAppActionKey = (id?: UUID) => [id, 'app-action'];
export const buildAppSettingsKey = (id?: UUID) => [id, 'app-settings'];
export const buildAppContextKey = (id?: UUID) => [id, 'context'];
export const AUTH_TOKEN_KEY = 'AUTH_TOKEN_KEY';
export const LOCAL_CONTEXT_KEY = 'LOCAL_CONTEXT_KEY';
export const buildFileContentKey = (id?: UUID) => ['files', id, 'content'];
export const buildAppSettingFileContentKey = (id?: UUID) => [
  'app-settings',
  'files',
  id,
  'content',
];

export const buildPostMessageKeys = (itemId: UUID) => ({
  GET_CONTEXT_SUCCESS: `GET_CONTEXT_SUCCESS_${itemId}`,
  GET_CONTEXT_FAILURE: `GET_CONTEXT_FAILURE_${itemId}`,
  GET_CONTEXT: `GET_CONTEXT_${itemId}`,
  GET_AUTH_TOKEN: `GET_AUTH_TOKEN_${itemId}`,
  GET_AUTH_TOKEN_SUCCESS: `GET_AUTH_TOKEN_SUCCESS_${itemId}`,
  GET_AUTH_TOKEN_FAILURE: `GET_AUTH_TOKEN_FAILURE_${itemId}`,
});

export const MUTATION_KEYS = {
  POST_APP_DATA: 'POST_APP_DATA',
  PATCH_APP_DATA: 'PATCH_APP_DATA',
  DELETE_APP_DATA: 'DELETE_APP_DATA',
  PATCH_SETTINGS: 'PATCH_SETTINGS',
  POST_APP_ACTION: 'POST_APP_ACTION',
  POST_APP_SETTING: 'POST_APP_SETTING',
  PATCH_APP_SETTING: 'PATCH_APP_SETTING',
  DELETE_APP_SETTING: 'DELETE_APP_SETTING',
  FILE_UPLOAD: 'FILE_UPLOAD',
  APP_SETTING_FILE_UPLOAD: 'APP_SETTING_FILE_UPLOAD',
};

export const HOOK_KEYS = {
  buildAppDataKey,
  buildAppContextKey,
  buildAppActionKey,
};
