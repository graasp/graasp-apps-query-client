import { useQuery, useQueryClient } from '@tanstack/react-query';

import * as Api from '../api';
import { buildAppContextKey } from '../config/keys';
import { getApiHost, getDataOrThrow } from '../config/utils';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };
  return {
    useAppContext: () => {
      const queryClient = useQueryClient();
      const apiHost = getApiHost(queryClient);
      const { itemId, token } = getDataOrThrow(queryClient, {
        shouldMemberExist: false,
      });

      return useQuery({
        queryKey: buildAppContextKey(itemId),
        queryFn: () =>
          Api.getContext({
            itemId,
            token,
            apiHost,
          }),
        ...defaultOptions,
      });
    },
  };
};
