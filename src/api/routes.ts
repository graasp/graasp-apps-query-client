export const APP_DATA_ENDPOINT = 'app-data';
export const APP_ITEMS_ENDPOINT = 'app-items';
export const ITEMS_ROUTE = 'items';
export const APP_ITEMS_ROUTE = 'app-items';


export const buildDownloadFileRoute = (id: string) => {
  return `${APP_ITEMS_ENDPOINT}/${id}/download`;
};

export const buildDeleteResourceRoute = (itemId: string, id: string ) =>
  `${APP_ITEMS_ENDPOINT}/${itemId}/${APP_DATA_ENDPOINT}/${id}`;

export const buildUploadFilesRoute = (itemId: string) =>
  `${APP_ITEMS_ENDPOINT}/upload?id=${itemId}`;

export const buildGetAppResourcesRoute = (itemId: string) =>
  `${APP_ITEMS_ENDPOINT}/${itemId}/${APP_DATA_ENDPOINT}`;

export const buildGetUsersRoute = (itemId: string) =>
  `${APP_ITEMS_ENDPOINT}/${itemId}/context`;

  export const API_ROUTES = {
    buildDownloadFileRoute,
    buildDeleteResourceRoute,
    buildUploadFilesRoute,
    buildGetAppResourcesRoute,
    buildGetUsersRoute
  };