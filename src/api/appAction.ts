import { AppAction } from '@graasp/sdk';

import { ApiData } from '../types';
import configureAxios from './axios';
import { buildGetAppActionsRoute, buildPostAppActionRoute } from './routes';

const axios = configureAxios();

export const getAppActions = async (args: ApiData) => {
  const { token, itemId, apiHost } = args;
  return axios
    .get<AppAction[]>(`${apiHost}/${buildGetAppActionsRoute(itemId)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
};

export const postAppAction = (
  args: ApiData & {
    body: unknown;
  },
) => {
  const { token, itemId, apiHost, body } = args;
  return axios
    .post<AppAction>(`${apiHost}/${buildPostAppActionRoute({ itemId })}`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
};
