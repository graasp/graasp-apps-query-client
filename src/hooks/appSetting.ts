import { useQuery, useQueryClient } from '@tanstack/react-query';

import * as Api from '../api';
import { MissingFileIdError } from '../config/errors';
import { appSettingKeys } from '../config/keys';
import { getApiHost, getData, getDataOrThrow } from '../config/utils';
import { Data, QueryClientConfig } from '../types';
import { configureWsAppSettingHooks } from '../ws/hooks/app';
import { WebsocketClient } from '../ws/ws-client';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default (queryConfig: QueryClientConfig, websocketClient?: WebsocketClient) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };
  const { useAppSettingsUpdates } = configureWsAppSettingHooks(websocketClient);
  return {
    useAppSettings: <DataType extends Data = Data>(
      filters?: { name: string },
      options?: { getUpdates: boolean },
    ) => {
      const getUpdates = options?.getUpdates ?? true;
      const queryClient = useQueryClient();
      const apiHost = getApiHost(queryClient);
      const { token, itemId } = getData(queryClient, { shouldMemberExist: false });

      const enableWs = getUpdates && queryConfig.enableWebsocket;

      useAppSettingsUpdates(enableWs ? itemId : null);

      return useQuery({
        queryKey: appSettingKeys.single(itemId, filters),
        queryFn: () => {
          const { token: localToken, itemId: localItemId } = getDataOrThrow(queryClient, {
            shouldMemberExist: false,
          });

          return Api.getAppSettings<DataType>({
            itemId: localItemId,
            token: localToken,
            apiHost,
            filters,
          });
        },
        ...defaultOptions,
        enabled: Boolean(itemId) && Boolean(token),
      });
    },

    useAppSettingFile: (
      payload?: { appSettingId: string },
      { enabled = true }: { enabled?: boolean } = {},
    ) => {
      const queryClient = useQueryClient();

      const apiHost = getApiHost(queryClient);
      const { token } = getData(queryClient, { shouldMemberExist: false });

      return useQuery({
        queryKey: appSettingKeys.fileContent(payload?.appSettingId),
        queryFn: (): Promise<Blob> => {
          const { token: localToken } = getDataOrThrow(queryClient, {
            shouldMemberExist: false,
          });

          // the following check are verified in enabled
          if (!payload?.appSettingId) {
            throw new MissingFileIdError();
          }
          const { appSettingId } = payload;
          return Api.getAppSettingFileContent({
            id: appSettingId,
            apiHost,
            token: localToken,
          });
        },
        ...defaultOptions,
        enabled: Boolean(payload?.appSettingId) && Boolean(token) && enabled,
      });
    },
  };
};
