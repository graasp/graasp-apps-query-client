import { List } from 'immutable';
import { QueryClient, useQuery } from '@tanstack/react-query';
import * as Api from '../api';
import { MissingFileIdError } from '../config/errors';
import { buildAppDataKey, buildFileContentKey } from '../config/keys';
import { getApiHost, getData, getDataOrThrow } from '../config/utils';
import { QueryClientConfig } from '../types';
import { AppDataRecord } from '@graasp/sdk/frontend';
import { convertJs } from '@graasp/sdk';
import { WebsocketClient } from '../ws/ws-client';
import { configureWsAppDataHooks } from '../ws/hooks/app';

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
  const { useAppDataUpdates } = configureWsAppDataHooks(websocketClient);
  return {
    useAppData: (options?: { refetchInterval?: number; getUpdates?: boolean }) => {
      const refetchInterval = options?.refetchInterval ?? false;
      const getUpdates = options?.getUpdates ?? true;
      const apiHost = getApiHost(queryClient);
      const { itemId } = getData(queryClient);

      const enableWs = getUpdates ?? queryConfig.enableWebsocket;

      useAppDataUpdates(enableWs ? itemId : null);

      return useQuery({
        queryKey: buildAppDataKey(itemId),
        queryFn: (): Promise<List<AppDataRecord>> => {
          const { token, itemId } = getDataOrThrow(queryClient);
          return Api.getAppData({ itemId, token, apiHost }).then((data) => convertJs(data));
        },
        ...defaultOptions,
        refetchInterval,
      });
    },

    useAppDataFile: (
      payload?: { fileId: string },
      { enabled = true }: { enabled?: boolean } = {},
    ) => {
      const apiHost = getApiHost(queryClient);

      return useQuery({
        queryKey: buildFileContentKey(payload?.fileId),
        queryFn: () => {
          const { token } = getDataOrThrow(queryClient);

          if (!payload?.fileId) {
            throw new MissingFileIdError();
          }
          const { fileId } = payload;
          return Api.getAppDataFile({ id: fileId, apiHost, token }).then((data) => data);
        },
        ...defaultOptions,
        enabled,
      });
    },
  };
};
