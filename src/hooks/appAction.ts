import { List } from 'immutable';
import { QueryClient, useQuery } from '@tanstack/react-query';
import * as Api from '../api';
import { buildAppActionsKey } from '../config/keys';
import { getApiHost, getData, getDataOrThrow } from '../config/utils';
import { QueryClientConfig } from '../types';
import { convertJs } from '@graasp/sdk';
import { AppActionRecord } from '@graasp/sdk/frontend';

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
      const { itemId } = getData(queryClient);

      return useQuery({
        queryKey: buildAppActionsKey(itemId),
        queryFn: (): Promise<List<AppActionRecord>> => {
          const { token, itemId } = getDataOrThrow(queryClient);

          return Api.getAppActions({ itemId, token, apiHost }).then((data) => convertJs(data));
        },
        ...defaultOptions,
        enabled
      });
    },
  };
};
