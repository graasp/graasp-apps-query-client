import createRoutine from './utils';
import { MUTATION_KEYS } from '../config/keys';

export const getAppDataRoutine = createRoutine('GET_APP_DATA');
export const postAppDataRoutine = createRoutine('POST_APP_DATA');
export const patchAppDataRoutine = createRoutine('PATCH_APP_DATA');
export const deleteAppDataRoutine = createRoutine('DELETE_APP_DATA');

export const postAppActionRoutine = createRoutine(MUTATION_KEYS.POST_APP_ACTION);

export const patchSettingsRoutine = createRoutine('PATCH_SETTINGS');

export const getAuthTokenRoutine = createRoutine('GET_AUTH_TOKEN');
export const getLocalContextRoutine = createRoutine('GET_LOCAL_CONTEXT');

export const uploadFileRoutine = createRoutine('UPLOAD_FILE');
export const downloadFileRoutine = createRoutine('DOWNLOAD_FILE');
