import { List, Map } from 'immutable';
import { QueryClient, useQuery } from 'react-query';
import * as Api from '../api';
import { buildAppContextKey, buildAppDataKey } from '../config/keys';
import { getApiHost } from '../config/utils';
import { QueryClientConfig } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };
  return {
    useAppData: (payload: { token: string; itemId: string }) =>
      useQuery({
        queryKey: buildAppDataKey(payload.itemId),
        queryFn: () => {
          const apiHost = getApiHost(queryClient);
          return Api.getAppData({ ...payload, apiHost }).then((data) => List(data));
        },
        ...defaultOptions,
        enabled: Boolean(payload.itemId) && Boolean(payload.token),
      }),

    useAppContext: (payload: { token: string; itemId: string }) =>
      useQuery({
        queryKey: buildAppContextKey(payload.itemId),
        queryFn: () => {
          const apiHost = getApiHost(queryClient);
          return Api.getContext({ ...payload, apiHost }).then((data) => Map(data));
        },
        ...defaultOptions,
        enabled: Boolean(payload.itemId) && Boolean(payload.token),
      }),
  };
};
