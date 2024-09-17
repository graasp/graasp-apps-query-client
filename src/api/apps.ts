import { ApiData, AppContext } from '../types.js';
import configureAxios from './axios.js';
import { buildGetContextRoute } from './routes.js';

const axios = configureAxios();

export const getContext = async (args: ApiData) => {
  const { token, itemId, apiHost } = args;
  return axios
    .get<AppContext>(`${apiHost}/${buildGetContextRoute(itemId)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
};
