import { QueryClient, useQuery } from '@tanstack/react-query';
import * as Api from '../api';
import { buildAppContextKey } from '../config/keys';
import { getApiHost, getData, getDataOrThrow } from '../config/utils';
import { AppContextRecord, QueryClientConfig } from '../types';
import { convertJs } from '@graasp/sdk';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };
  return {
    useAppContext: () => {
      const apiHost = getApiHost(queryClient);
      const { itemId } = getData(queryClient, { shouldMemberExist: false });

      return useQuery({
        queryKey: buildAppContextKey(itemId),
        queryFn: (): Promise<AppContextRecord> => {
          const { token, itemId } = getDataOrThrow(queryClient, { shouldMemberExist: false });

          return Api.getContext({
            itemId,
            token,
            apiHost,
          }).then((data) => convertJs(data));
        },
        ...defaultOptions,
      });
    },
  };
};
