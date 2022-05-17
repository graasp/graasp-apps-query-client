export const APP_DATA_ENDPOINT = 'app-data';
export const ITEMS_ROUTE = 'items';
export const APP_ITEMS_ROUTE = 'app-items';
export const APP_ACTIONS_ENDPOINT = 'app-action';
export const APP_SETTINGS_ROUTE = 'app-settings';

export const buildDownloadFileRoute = (id: string) => {
  return `${APP_ITEMS_ROUTE}/${id}/download`;
};

export const buildGetAppDataRoute = (itemId: string) =>
  `${APP_ITEMS_ROUTE}/${itemId}/${APP_DATA_ENDPOINT}`;

export const buildPostAppDataRoute = (payload: { itemId: string }) =>
  `${APP_ITEMS_ROUTE}/${payload.itemId}/${APP_DATA_ENDPOINT}`;

export const buildPatchAppDataRoute = (payload: { itemId: string; id: string }) =>
  `${APP_ITEMS_ROUTE}/${payload.itemId}/${APP_DATA_ENDPOINT}/${payload.id}`;

export const buildDeleteAppDataRoute = (payload: { itemId: string; id: string }) =>
  `${APP_ITEMS_ROUTE}/${payload.itemId}/${APP_DATA_ENDPOINT}/${payload.id}`;

export const buildGetAppActionsRoute = (itemId: string) =>
  `${APP_ITEMS_ROUTE}/${itemId}/${APP_ACTIONS_ENDPOINT}`;

export const buildPostAppActionRoute = (payload: { itemId: string }) =>
  `${APP_ITEMS_ROUTE}/${payload.itemId}/${APP_ACTIONS_ENDPOINT}`;

// todo: rename
export const buildDownloadFilesRoute = (id: string) => `${APP_ITEMS_ROUTE}/${id}/download`;

// todo: rename to buildUploadAppDataFilesRoute
export const buildUploadFilesRoute = (itemId: string) => `${APP_ITEMS_ROUTE}/upload?id=${itemId}`;

export const buildUploadAppSettingFilesRoute = (itemId: string) =>
  `${APP_ITEMS_ROUTE}/${APP_SETTINGS_ROUTE}/upload?id=${itemId}`;

export const buildDownloadAppSettingFileRoute = (id: string) =>
  `${APP_ITEMS_ROUTE}/${APP_SETTINGS_ROUTE}/${id}/download`;

export const buildGetContextRoute = (itemId: string) => `${APP_ITEMS_ROUTE}/${itemId}/context`;

export const buildGetAppSettingsRoute = (itemId: string) =>
  `${APP_ITEMS_ROUTE}/${itemId}/${APP_SETTINGS_ROUTE}`;

export const buildPostAppSettingRoute = (payload: { itemId: string }) =>
  `${APP_ITEMS_ROUTE}/${payload.itemId}/${APP_SETTINGS_ROUTE}`;

export const buildPatchAppSettingRoute = (payload: { itemId: string; id: string }) =>
  `${APP_ITEMS_ROUTE}/${payload.itemId}/${APP_SETTINGS_ROUTE}/${payload.id}`;

export const buildDeleteAppSettingRoute = (payload: { itemId: string; id: string }) =>
  `${APP_ITEMS_ROUTE}/${payload.itemId}/${APP_SETTINGS_ROUTE}/${payload.id}`;

export const API_ROUTES = {
  buildDownloadFileRoute,
  buildDeleteAppDataRoute,
  buildUploadFilesRoute,
  buildGetAppDataRoute,
  buildGetContextRoute,
  buildPostAppDataRoute,
  buildPatchAppDataRoute,
  buildGetAppActionsRoute,
  buildPostAppActionRoute,
  buildGetAppSettingsRoute,
  buildPatchAppSettingRoute,
  buildPostAppSettingRoute,
  buildDeleteAppSettingRoute,
  buildUploadAppSettingFilesRoute,
  buildDownloadAppSettingFileRoute,
};
