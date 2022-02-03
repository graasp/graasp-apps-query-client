import { List, Map } from 'immutable';
import { QueryClient, useQuery } from 'react-query';
import * as Api from '../api';
import { buildAppContextKey, buildAppDataKey } from '../config/keys';
import { QueryClientConfig } from '../types';

export default (_queryClient: QueryClient, queryConfig: QueryClientConfig) => {
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
        queryFn: () => Api.getAppData(payload, queryConfig).then((data) => List(data)),
        ...defaultOptions,
        enabled: Boolean(payload.itemId) && Boolean(payload.token),
      }),

    useAppContext: (payload: { token: string; itemId: string }) =>
      useQuery({
        queryKey: buildAppContextKey(payload.itemId),
        queryFn: () => Api.getContext(payload, queryConfig).then((data) => Map(data)),
        ...defaultOptions,
        enabled: Boolean(payload.itemId) && Boolean(payload.token),
      }),
  };
};
