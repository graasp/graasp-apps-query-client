import { PermissionLevel } from '@graasp/sdk';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import * as Api from '../api/index.js';
import { appActionKeys } from '../config/keys.js';
import { getApiHost, getData, getDataOrThrow, getPermissionLevel } from '../config/utils.js';
import { Data, QueryClientConfig } from '../types.js';
import { configureWsAppActionsHooks } from '../ws/hooks/app.js';
import { WebsocketClient } from '../ws/ws-client.js';

export default (queryConfig: QueryClientConfig, websocketClient?: WebsocketClient) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };
  const { useAppActionsUpdates } = configureWsAppActionsHooks(websocketClient);
  return {
    useAppActions: <DataType extends Data = Data>(options?: {
      enabled?: boolean;
      getUpdates?: boolean;
    }) => {
      const enabled = options?.enabled ?? true;
      const getUpdates = options?.enabled ?? true;
      const enableWs = getUpdates ?? queryConfig.enableWebsocket;
      const queryClient = useQueryClient();
      const apiHost = getApiHost(queryClient);
      const permissionLevel = getPermissionLevel(queryClient);

      const { itemId } = getData(queryClient);

      useAppActionsUpdates(enableWs && permissionLevel === PermissionLevel.Admin ? itemId : null);

      return useQuery({
        queryKey: appActionKeys.single(itemId),
        queryFn: () => {
          const { token } = getDataOrThrow(queryClient);

          return Api.getAppActions<DataType>({ itemId, token, apiHost });
        },
        ...defaultOptions,
        enabled,
      });
    },
  };
};
