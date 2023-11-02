import { PermissionLevel } from '@graasp/sdk';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import * as Api from '../api';
import { buildAppActionsKey } from '../config/keys';
import { getApiHost, getData, getDataOrThrow, getPermissionLevel } from '../config/utils';
import { QueryClientConfig } from '../types';
import { configureWsAppActionsHooks } from '../ws/hooks/app';
import { WebsocketClient } from '../ws/ws-client';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default (queryConfig: QueryClientConfig, websocketClient?: WebsocketClient) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };
  const { useAppActionsUpdates } = configureWsAppActionsHooks(websocketClient);
  return {
    useAppActions: (options?: { enabled?: boolean; getUpdates?: boolean }) => {
      const enabled = options?.enabled ?? true;
      const getUpdates = options?.enabled ?? true;
      const enableWs = getUpdates ?? queryConfig.enableWebsocket;
      const queryClient = useQueryClient();
      const apiHost = getApiHost(queryClient);
      const permissionLevel = getPermissionLevel(queryClient);

      const { itemId } = getData(queryClient);

      useAppActionsUpdates(enableWs && permissionLevel === PermissionLevel.Admin ? itemId : null);

      return useQuery({
        queryKey: buildAppActionsKey(itemId),
        queryFn: () => {
          const { token } = getDataOrThrow(queryClient);

          return Api.getAppActions({ itemId, token, apiHost }).then((data) => data);
        },
        ...defaultOptions,
        enabled,
      });
    },
  };
};
