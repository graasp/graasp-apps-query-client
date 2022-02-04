import { UUID } from '../types';

export const buildAppDataKey = (id?: UUID) => [id, 'app-data'];
export const buildAppContextKey = (id?: UUID) => [id, 'context'];
export const AUTH_TOKEN_KEY = 'AUTH_TOKEN_KEY';
export const LOCAL_CONTEXT_KEY = 'LOCAL_CONTEXT_KEY';

export const POST_MESSAGE_KEYS = {
  GET_CONTEXT_SUCCEEDED: 'GET_CONTEXT_SUCCEEDED',
  GET_CONTEXT_FAILED: 'GET_CONTEXT_FAILED',
  GET_CONTEXT: 'GET_CONTEXT',
  GET_AUTH_TOKEN: 'GET_AUTH_TOKEN',
  GET_AUTH_TOKEN_SUCCEEDED: 'GET_AUTH_TOKEN_SUCCEEDED',
  GET_AUTH_TOKEN_FAILED: 'GET_AUTH_TOKEN_FAILED',
};

export const MUTATION_KEYS = {
  POST_APP_DATA: 'POST_APP_DATA',
  PATCH_APP_DATA: 'PATCH_APP_DATA',
  DELETE_APP_DATA: 'DELETE_APP_DATA',
  PATCH_SETTINGS: 'PATCH_SETTINGS',
};

export const HOOK_KEYS = {
  buildAppDataKey,
  buildAppContextKey,
};
