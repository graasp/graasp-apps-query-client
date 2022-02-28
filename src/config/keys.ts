import { UUID } from '../types';

export const buildAppDataKey = (id?: UUID) => [id, 'app-data'];
export const buildAppContextKey = (id?: UUID) => [id, 'context'];
export const AUTH_TOKEN_KEY = 'AUTH_TOKEN_KEY';
export const LOCAL_CONTEXT_KEY = 'LOCAL_CONTEXT_KEY';
export const buildFileContentKey = (id?: UUID) => ['files', id, 'content'];

export const POST_MESSAGE_KEYS = {
  GET_CONTEXT_SUCCESS: 'GET_CONTEXT_SUCCESS',
  GET_CONTEXT_FAILURE: 'GET_CONTEXT_FAILURE',
  GET_CONTEXT: 'GET_CONTEXT',
  GET_AUTH_TOKEN: 'GET_AUTH_TOKEN',
  GET_AUTH_TOKEN_SUCCESS: 'GET_AUTH_TOKEN_SUCCESS',
  GET_AUTH_TOKEN_FAILURE: 'GET_AUTH_TOKEN_FAILURE',
};

export const MUTATION_KEYS = {
  POST_APP_DATA: 'POST_APP_DATA',
  PATCH_APP_DATA: 'PATCH_APP_DATA',
  DELETE_APP_DATA: 'DELETE_APP_DATA',
  PATCH_SETTINGS: 'PATCH_SETTINGS',
  FILE_UPLOAD: 'FILE_UPLOAD',
};

export const HOOK_KEYS = {
  buildAppDataKey,
  buildAppContextKey,
};
