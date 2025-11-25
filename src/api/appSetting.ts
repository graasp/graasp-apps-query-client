import { AppSetting, appendQueryParamToUrl } from '@graasp/sdk';

import { ApiData, Data } from '../types.js';
import configureAxios from './axios.js';
import {
  buildDeleteAppSettingRoute,
  buildDownloadAppSettingFileRoute,
  buildGetAppSettingsRoute,
  buildPatchAppSettingRoute,
  buildPostAppSettingRoute,
  buildUploadAppSettingFilesRoute,
} from './routes.js';

const axios = configureAxios();

export const getAppSettings = async <DataType extends Data = Data>(
  args: ApiData & { filters?: { name: string } },
) => {
  const { token, itemId, apiHost, filters } = args;
  const url = appendQueryParamToUrl(
    `${apiHost}/${buildGetAppSettingsRoute(itemId)}`,
    filters ?? {},
  );
  return axios
    .get<AppSetting<DataType>[]>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
};

export const postAppSetting = (
  args: ApiData & {
    body: unknown;
  },
) => {
  const { token, itemId, apiHost, body } = args;
  return axios
    .post<AppSetting>(`${apiHost}/${buildPostAppSettingRoute({ itemId })}`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
};

export const patchAppSetting = (
  args: ApiData & {
    id: string;
    data: unknown;
  },
) => {
  const { token, itemId, id, apiHost, data } = args;
  return axios
    .patch<AppSetting>(
      `${apiHost}/${buildPatchAppSettingRoute({ itemId, id })}`,
      { data },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    .then(({ data: newData }) => newData);
};

export const deleteAppSetting = (
  args: ApiData & {
    id: string;
  },
) => {
  const { token, itemId, id, apiHost } = args;
  return axios
    .delete<AppSetting>(`${apiHost}/${buildDeleteAppSettingRoute({ itemId, id })}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
};

export const uploadAppSettingFile = async (
  args: ApiData & {
    name?: string;
    file: Blob;
  },
) => {
  const { token, itemId, apiHost } = args;

  const payload = new FormData();

  if (args.name) {
    payload.append('name', args.name);
  }
  /* WARNING: this file field needs to be the last one,
   * otherwise the normal fields can not be read
   * https://github.com/fastify/fastify-multipart?tab=readme-ov-file#usage
   */
  payload.append('files', args.file);

  return axios
    .post(`${apiHost}/${buildUploadAppSettingFilesRoute(itemId)}`, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
        authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
};

// todo: add return type for file
// todo: add public route
// because of the bearer token, it triggers an error on s3 on redirect because the request has two auth methods
// https://github.com/axios/axios/issues/2855
// https://stackoverflow.com/questions/50861144/reactjs-remove-http-header-before-redirect/51252434#51252434
// so we removed automatic redirection for this endpoint
export const getAppSettingFileContent = async ({
  id,
  apiHost,
  token,
}: {
  id: string;
  apiHost: string;
  token: string;
}) => {
  const url = await axios
    .get<string>(`${apiHost}/${buildDownloadAppSettingFileRoute(id)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
  return axios
    .get<Blob>(url, {
      responseType: 'blob',
      withCredentials: false,
    })
    .then(({ data }) => data);
};
