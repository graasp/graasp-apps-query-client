import { List } from 'immutable';
import { QueryClient, useQuery } from '@tanstack/react-query';
import * as Api from '../api';
import { buildAppActionsKey } from '../config/keys';
import { getApiHost, getData, getDataOrThrow, getPermissionLevel } from '../config/utils';
import { QueryClientConfig } from '../types';
import { PermissionLevel, convertJs } from '@graasp/sdk';
import { AppActionRecord } from '@graasp/sdk/frontend';
import { WebsocketClient } from '../ws/ws-client';
import { configureWsAppActionsHooks } from '../ws/hooks/app';

export default (
  queryClient: QueryClient,
  queryConfig: QueryClientConfig,
  websocketClient?: WebsocketClient,
) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };
  const { useAppActionsUpdates } = configureWsAppActionsHooks(websocketClient);
  return {
    useAppActions: (options?: { enabled?: boolean; getUpdates?: boolean }) => {
      const { enabled, getUpdates } = options || {};
      const enableWs = getUpdates ?? queryConfig.enableWebsocket;
      const apiHost = getApiHost(queryClient);
      const permissionLevel = getPermissionLevel(queryClient);
      const { itemId } = getData(queryClient);

      useAppActionsUpdates(enableWs && permissionLevel === PermissionLevel.Admin ? itemId : null);

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
