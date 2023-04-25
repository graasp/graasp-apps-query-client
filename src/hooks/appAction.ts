import { List } from 'immutable';
import { QueryClient, useQuery } from '@tanstack/react-query';
import * as Api from '../api';
import { buildAppActionsKey } from '../config/keys';
import { getApiHost, getDataOrThrow } from '../config/utils';
import { QueryClientConfig } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };
  return {
    useAppActions: ({ enabled = true }: { enabled: boolean }) => {
      const apiHost = getApiHost(queryClient);
      const { token, itemId } = getDataOrThrow(queryClient);

      return useQuery({
        queryKey: buildAppActionsKey(itemId),
        queryFn: () => {
          return Api.getAppActions({ itemId, token, apiHost }).then((data) => List(data));
        },
        ...defaultOptions,
        enabled: Boolean(itemId) && Boolean(token) && enabled,
      });
    },
  };
};
