import { buildDeleteAppDataRoute, buildGetAppDataRoute, buildGetContextRoute } from './routes';
import { QueryClientConfig } from '../types';
import configureAxios from './axios';

const axios = configureAxios();

export const getAppData = async (
  args: {
    token: string;
    itemId: string;
  },
  { API_HOST }: QueryClientConfig,
) => {
  const { token, itemId } = args;
  return axios
    .get(`${API_HOST}/${buildGetAppDataRoute(itemId)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
};

export const getContext = async (
  args: {
    token: string;
    itemId: string;
  },
  { API_HOST }: QueryClientConfig,
) => {
  const { token, itemId } = args;
  return axios
    .get(`${API_HOST}/${buildGetContextRoute(itemId)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data?.members);
};

export const deleteAppData = (
  args: {
    token: string;
    itemId: string;
    id: string;
  },
  { API_HOST }: QueryClientConfig,
) => {
  const { token, itemId, id } = args;
  return axios
    .delete(`${API_HOST}/${buildDeleteAppDataRoute(itemId, id)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
};
