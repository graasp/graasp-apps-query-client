import { useQuery, useQueryClient } from '@tanstack/react-query';

import * as Api from '../api';
import { MissingFileIdError } from '../config/errors';
import { buildAppDataKey, buildFileContentKey } from '../config/keys';
import { getApiHost, getData, getDataOrThrow } from '../config/utils';
import { Data, QueryClientConfig } from '../types';
import { configureWsAppDataHooks } from '../ws/hooks/app';
import { WebsocketClient } from '../ws/ws-client';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
        getUpdates?: boolean;
      },
    ) => {
      const refetchInterval = options?.refetchInterval ?? false;
      const getUpdates = options?.getUpdates ?? true;
      const queryClient = useQueryClient();

      const apiHost = getApiHost(queryClient);
      const { itemId } = getData(queryClient);

      const enableWs = getUpdates ?? queryConfig.enableWebsocket;

      useAppDataUpdates(enableWs ? itemId : null);

      return useQuery({
        queryKey: buildAppDataKey(itemId),
        queryFn: () => {
          const { token } = getDataOrThrow(queryClient);
          return Api.getAppData<DataType>({ itemId, token, apiHost, filters });
        },
        ...defaultOptions,
        refetchInterval,
      });
    },

    useAppDataFile: (
      payload?: { fileId: string },
      { enabled = true }: { enabled?: boolean } = {},
    ) => {
      const queryClient = useQueryClient();
      const apiHost = getApiHost(queryClient);

      return useQuery({
        queryKey: buildFileContentKey(payload?.fileId),
        queryFn: () => {
          const { token } = getDataOrThrow(queryClient);

          if (!payload?.fileId) {
            throw new MissingFileIdError();
          }
          const { fileId } = payload;
          return Api.getAppDataFile({ id: fileId, apiHost, token });
        },
        ...defaultOptions,
        enabled,
      });
    },
  };
};
