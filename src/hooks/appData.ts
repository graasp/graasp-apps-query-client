import { useQuery, useQueryClient } from '@tanstack/react-query';

import * as Api from '../api/index.js';
import { MissingFileIdError } from '../config/errors.js';
import { appDataKeys } from '../config/keys.js';
import { getApiHost, getData, getDataOrThrow } from '../config/utils.js';
import { Data, QueryClientConfig } from '../types.js';
import { configureWsAppDataHooks } from '../ws/hooks/app.js';
import { WebsocketClient } from '../ws/ws-client.js';

export default (
  queryConfig: QueryClientConfig,

  websocketClient?: WebsocketClient,
) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };
  const { useAppDataUpdates } = configureWsAppDataHooks(websocketClient);
  return {
    useAppData: <DataType extends Data = Data>(
      filters?: { type: string },
      options?: {
        refetchInterval?: number;
        enabled?: boolean;
        getUpdates?: boolean;
      },
    ) => {
      const refetchInterval = options?.refetchInterval ?? false;
      const enabled = options?.enabled ?? true;
      const getUpdates = options?.getUpdates ?? true;
      const queryClient = useQueryClient();

      const apiHost = getApiHost(queryClient);
      const { itemId } = getData(queryClient);

      const enableWs = getUpdates ?? queryConfig.enableWebsocket;

      useAppDataUpdates(enableWs ? itemId : null);

      return useQuery({
        queryKey: appDataKeys.single(itemId),
        queryFn: () => {
          const { token } = getDataOrThrow(queryClient);
          return Api.getAppData<DataType>({ itemId, token, apiHost, filters });
        },
        ...defaultOptions,
        enabled,
        refetchInterval,
      });
    },

    useAppDataFile: (
      payload?: { fileId: string },
      { enabled = true }: { enabled?: boolean } = {},
    ) => {
      const queryClient = useQueryClient();
      const apiHost = getApiHost(queryClient);

      const fileId = payload?.fileId;

      return useQuery({
        queryKey: appDataKeys.fileContent(fileId),
        queryFn: () => {
          const { token } = getDataOrThrow(queryClient);
          if (!fileId) {
            throw new MissingFileIdError();
          }
          return Api.getAppDataFile({ id: fileId, apiHost, token });
        },
        ...defaultOptions,
        enabled,
      });
    },
  };
};
