import { DEFAULT_DELETE, DEFAULT_GET, DEFAULT_GET_REQUEST, DEFAULT_PATCH } from './utils';
import { buildDeleteResourceRoute, buildGetAppResourcesRoute, buildGetUsersRoute } from './routes';
import { useMutation } from 'react-query';


// // eslint-disable-next-line import/prefer-default-export
// export const getApps = async ({ API_HOST }: QueryClientConfig) => {
//   const res = await fetch(`${API_HOST}/${buildAppListRoute}`, DEFAULT_GET).then(
//     failOnError,
//   );

//   return res.json();
// };

export const useGetAppResources = async (token: string, apiHost: string, itemId: string) => {
  // return useQuery(['resources', reFetch], async () => {
  const url = `${apiHost}/${buildGetAppResourcesRoute(itemId)}`;
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

export const useGetUsers = async (token: string, apiHost: string, itemId: string) => {
    // return useQuery('users', async () => {
      const url = `${apiHost}/${buildGetUsersRoute(itemId)}`;
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

export const useDeleteResource = (token: string, apiHost: string, itemId: string, id: string) => {
    return useMutation(() => {
      const url = `${apiHost}/${buildDeleteResourceRoute(itemId, id)}`;
  
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
