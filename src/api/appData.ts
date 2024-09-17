import { AppData, UUID, appendQueryParamToUrl } from '@graasp/sdk';

import { ApiData, Data } from '../types.js';
import configureAxios from './axios.js';
import {
  buildDeleteAppDataRoute,
  buildDownloadAppDataFileRoute,
  buildGetAppDataRoute,
  buildPatchAppDataRoute,
  buildPostAppDataRoute,
} from './routes.js';

const axios = configureAxios();

export const getAppData = async <DataType extends Data = Data>(
  args: ApiData & { filters?: { [key: string]: string } },
) => {
  const { token, itemId, apiHost, filters } = args;
  const url = appendQueryParamToUrl(`${apiHost}/${buildGetAppDataRoute(itemId)}`, filters ?? {});
  return axios
    .get<AppData<DataType>[]>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
};

export const postAppData = (
  args: ApiData & {
    body: unknown;
  },
) => {
  const { token, itemId, apiHost, body } = args;
  return axios
    .post<AppData>(`${apiHost}/${buildPostAppDataRoute({ itemId })}`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
};

export const patchAppData = (args: ApiData & Partial<AppData> & { id: UUID }) => {
  const { token, itemId, id, apiHost, data } = args;
  return axios
    .patch<AppData>(
      `${apiHost}/${buildPatchAppDataRoute({ itemId, id })}`,
      { data },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    .then(({ data: newData }) => newData);
};

export const deleteAppData = (
  args: ApiData & {
    id: string;
  },
) => {
  const { token, itemId, id, apiHost } = args;
  return axios
    .delete<AppData>(`${apiHost}/${buildDeleteAppDataRoute({ itemId, id })}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
};

// todo: add return type of file
// because of the bearer token, it triggers an error on s3 on redirect because the request has two auth methods
// https://github.com/axios/axios/issues/2855
// https://stackoverflow.com/questions/50861144/reactjs-remove-http-header-before-redirect/51252434#51252434
// so we removed automatic redirection for this endpoint
export const getAppDataFile = async ({
  id,
  apiHost,
  token,
}: {
  id: string;
  apiHost: string;
  token: string;
}) => {
  const url = await axios
    .get<string>(`${apiHost}/${buildDownloadAppDataFileRoute(id)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
  return axios
    .get<Blob>(url, {
      responseType: 'blob',
      headers: {
        'Access-Control-Allow-Credentials': true,
      },
    })
    .then(({ data }) => data);
};
