import {
  buildDeleteAppDataRoute,
  buildGetAppDataRoute,
  buildGetContextRoute,
  buildPatchAppDataRoute,
  buildPatchSettingsRoute,
  buildPostAppDataRoute,
  buildPostAppActionsRoute,
} from './routes';
import configureAxios from './axios';

const axios = configureAxios();

export const getContext = async (args: { token: string; itemId: string; apiHost: string }) => {
  const { token, itemId, apiHost } = args;
  return axios
    .get(`${apiHost}/${buildGetContextRoute(itemId)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
};

export const getAppData = async (args: { token: string; itemId: string; apiHost: string }) => {
  const { token, itemId, apiHost } = args;
  return axios
    .get(`${apiHost}/${buildGetAppDataRoute(itemId)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
};

export const postAppData = (args: {
  token: string;
  itemId: string;
  body: any;
  apiHost: string;
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

export const patchAppData = (args: {
  token: string;
  itemId: string;
  id: string;
  apiHost: string;
  data: any;
}) => {
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

export const deleteAppData = (args: {
  token: string;
  itemId: string;
  id: string;
  apiHost: string;
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

export const patchSettings = (args: {
  token: string;
  itemId: string;
  apiHost: string;
  settings: any;
}) => {
  const { token, itemId, apiHost, settings } = args;
  return axios
    .patch(`${apiHost}/${buildPatchSettingsRoute({ itemId })}`, settings, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
};

export const postAppAction = (args: {
  token: string;
  itemId: string;
  body: any;
  apiHost: string;
}) => {
  const { token, itemId, apiHost, body } = args;
  return axios
    .post(`${apiHost}/${buildPostAppActionsRoute({ itemId })}`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
};
