import { List } from 'immutable';
import { QueryClient, useQuery } from '@tanstack/react-query';
import * as Api from '../api';
import { buildAppActionsKey } from '../config/keys';
import { getApiHost, getData, getDataOrThrow, getPermissionLevel } from '../config/utils';
import { QueryClientConfig } from '../types';
import { PermissionLevel, convertJs } from '@graasp/sdk';
import { AppActionRecord } from '@graasp/sdk/frontend';

export default (
  queryClient: QueryClient,
  queryConfig: QueryClientConfig,
  useAppActionsUpdates?: (itemId: string | null | undefined) => void,
) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };
  return {
    useAppActions: (
      { enabled = true }: { enabled?: boolean } = {},
      getUpdates = queryConfig.enableWebsocket,
    ) => {
      const apiHost = getApiHost(queryClient);
      const permissionLevel = getPermissionLevel(queryClient);
      const { itemId } = getData(queryClient);

      if (
        typeof useAppActionsUpdates !== 'undefined' &&
        getUpdates &&
        permissionLevel === PermissionLevel.Admin
      ) {
        useAppActionsUpdates(itemId);
      }

      return useQuery({
        queryKey: buildAppActionsKey(itemId),
        queryFn: (): Promise<List<AppActionRecord>> => {
          const { token, itemId } = getDataOrThrow(queryClient);

          return Api.getAppActions({ itemId, token, apiHost }).then((data) => convertJs(data));
        },
        ...defaultOptions,
        enabled,
      });
    },
  };
};
