import { DEFAULT_DELETE, DEFAULT_GET, DEFAULT_GET_REQUEST, DEFAULT_PATCH } from './utils';
import { buildDeleteResourceRoute, buildGetAppResourcesRoute, buildGetUsersRoute } from './routes';
import { useMutation } from 'react-query';
import { QueryClientConfig } from '../types';

export const useGetAppResources = async (
  token: string,
  _apiHost: string,
  itemId: string,
  { API_HOST }: QueryClientConfig,
) => {
  // return useQuery(['resources', reFetch], async () => {
  const url = `${API_HOST}/${buildGetAppResourcesRoute(itemId)}`;
  const response = await fetch(url, {
    ...DEFAULT_GET,
    headers: {
      ...DEFAULT_GET_REQUEST.headers,
      Authorization: `Bearer ${token}`,
    },
  });
  const resources = await response.json();
  return resources;
  // });
};

export const useGetUsers = async (
  token: string,
  _apiHost: string,
  itemId: string,
  { API_HOST }: QueryClientConfig,
) => {
  // return useQuery('users', async () => {
  const url = `${API_HOST}/${buildGetUsersRoute(itemId)}`;
  const response = await fetch(url, {
    ...DEFAULT_GET,
    headers: {
      ...DEFAULT_GET_REQUEST.headers,
      Authorization: `Bearer ${token}`,
    },
  });
  const users = (await response.json())?.members;
  return users;
  // });
};

export const useDeleteResource = (
  token: string,
  _apiHost: string,
  itemId: string,
  id: string,
  { API_HOST }: QueryClientConfig,
) => {
  return useMutation(() => {
    const url = `${API_HOST}/${buildDeleteResourceRoute(itemId, id)}`;

    const response = fetch(url, {
      ...DEFAULT_DELETE,
      headers: {
        ...DEFAULT_PATCH.headers,
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  });
};
