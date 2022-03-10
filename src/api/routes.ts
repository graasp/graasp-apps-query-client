export const APP_DATA_ENDPOINT = 'app-data';
export const ITEMS_ROUTE = 'items';
export const APP_ITEMS_ROUTE = 'app-items';
export const APP_ACTIONS_ENDPOINT = 'app-action';

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

export const buildPostAppActionsRoute = (payload: { itemId: string }) =>
  `${APP_ITEMS_ROUTE}/${payload.itemId}/${APP_ACTIONS_ENDPOINT}`;

export const buildDownloadFilesRoute = (id: string) => `${APP_ITEMS_ROUTE}/${id}/download`;

export const buildUploadFilesRoute = (itemId: string) => `${APP_ITEMS_ROUTE}/upload?id=${itemId}`;

export const buildPatchSettingsRoute = (payload: { itemId: string }) =>
  `${APP_ITEMS_ROUTE}/${payload.itemId}/settings`;

export const buildGetContextRoute = (itemId: string) => `${APP_ITEMS_ROUTE}/${itemId}/context`;

export const API_ROUTES = {
  buildDownloadFileRoute,
  buildDeleteAppDataRoute,
  buildUploadFilesRoute,
  buildGetAppDataRoute,
  buildGetContextRoute,
  buildPostAppDataRoute,
  buildPatchSettingsRoute,
  buildPatchAppDataRoute,
  buildGetAppActionsRoute,
  buildPostAppActionsRoute,
};