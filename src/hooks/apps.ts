import { useQuery, useQueryClient } from 'react-query';
import * as Api from '../api';
import { RESOURCES_KEY } from '../config/keys';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };

  return {
    useAppResources: (
      token: string,
      apiHost: string,
      itemId: string,
      // reFetch: boolean,
    ) => {
      const cache = useQueryClient();
      useQuery({
        queryKey: RESOURCES_KEY,
        queryFn: () => Api.useGetAppResources(token, apiHost, itemId),
        ...defaultOptions,
        onSuccess: () => {
          cache.invalidateQueries(RESOURCES_KEY);
        },
      });
    },
  };
};
