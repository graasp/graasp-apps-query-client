import createRoutine from './utils';

export const getAppDataRoutine = createRoutine('GET_APP_DATA');
export const postAppDataRoutine = createRoutine('POST_APP_DATA');
export const patchAppDataRoutine = createRoutine('PATCH_APP_DATA');
export const deleteAppDataRoutine = createRoutine('DELETE_APP_DATA');

export const patchSettingsRoutine = createRoutine('PATCH_SETTINGS');

export const getAuthTokenRoutine = createRoutine('GET_AUTH_TOKEN');
export const getLocalContextRoutine = createRoutine('GET_LOCAL_CONTEXT');
