import {
  buildDeleteAppDataRoute,
  buildDownloadFilesRoute,
  buildGetAppDataRoute,
  buildGetContextRoute,
  buildPatchAppDataRoute,
  buildPostAppDataRoute,
  buildGetAppActionsRoute,
  buildPostAppActionRoute,
} from './routes';
import configureAxios from './axios';
import { ApiData, AppData, UUID } from '../types';

const axios = configureAxios();

export const getContext = async (args: ApiData) => {
  const { token, itemId, apiHost } = args;
  return axios
    .get(`${apiHost}/${buildGetContextRoute(itemId)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
};

// APP DATA
export const getAppData = async (args: ApiData) => {
  const { token, itemId, apiHost } = args;
  return axios
    .get(`${apiHost}/${buildGetAppDataRoute(itemId)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
};

export const postAppData = (args: ApiData & {
  body: unknown;
}) => {
  const { token, itemId, apiHost, body } = args;
  return axios
    .post(`${apiHost}/${buildPostAppDataRoute({ itemId })}`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
};

export const patchAppData = (args: ApiData & Partial<AppData> & { id: UUID }) => {
  const { token, itemId, id, apiHost, data } = args;
  return axios
    .patch(
      `${apiHost}/${buildPatchAppDataRoute({ itemId, id })}`,
      { data },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    .then(({ data }) => data);
};

export const deleteAppData = (args: ApiData & {
  id: string;
}) => {
  const { token, itemId, id, apiHost } = args;
  return axios
    .delete(`${apiHost}/${buildDeleteAppDataRoute({ itemId, id })}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
};

export const getAppActions = async (args: ApiData) => {
  const { token, itemId, apiHost } = args;
  return axios
    .get(`${apiHost}/${buildGetAppActionsRoute(itemId)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
};

export const postAppAction = (args: ApiData & {
  body: unknown;
}) => {
  const { token, itemId, apiHost, body } = args;
  return axios
    .post(`${apiHost}/${buildPostAppActionRoute({ itemId })}`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
};
// todo: add public route
// because of the bearer token, it triggers an error on s3 on redirect because the request has two auth methods
// https://github.com/axios/axios/issues/2855
// https://stackoverflow.com/questions/50861144/reactjs-remove-http-header-before-redirect/51252434#51252434
// so we removed automatic redirection for this endpoint
export const getFileContent = async ({
  id,
  apiHost,
  token,
}: {
  id: string;
  apiHost: string;
  token: string;
}) => {
  const url = await axios
    .get(`${apiHost}/${buildDownloadFilesRoute(id)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
  return axios
    .get(url, {
      responseType: 'blob',
      withCredentials: false,
    })
    .then(({ data }) => data);
};
