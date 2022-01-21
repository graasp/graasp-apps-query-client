export const APP_DATA_ENDPOINT = 'app-data';
export const ITEMS_ROUTE = 'items';
export const APP_ITEMS_ROUTE = 'app-items';

export const buildDownloadFileRoute = (id: string) => {
  return `${APP_ITEMS_ROUTE}/${id}/download`;
};

export const buildDeleteResourceRoute = (itemId: string, id: string) =>
  `${APP_ITEMS_ROUTE}/${itemId}/${APP_DATA_ENDPOINT}/${id}`;

export const buildUploadFilesRoute = (itemId: string) =>
  `${APP_ITEMS_ROUTE}/upload?id=${itemId}`;

export const buildGetAppResourcesRoute = (itemId: string) =>
  `${APP_ITEMS_ROUTE}/${itemId}/${APP_DATA_ENDPOINT}`;

export const buildGetUsersRoute = (itemId: string) =>
  `${APP_ITEMS_ROUTE}/${itemId}/context`;

export const API_ROUTES = {
  buildDownloadFileRoute,
  buildDeleteResourceRoute,
  buildUploadFilesRoute,
  buildGetAppResourcesRoute,
  buildGetUsersRoute
};
