import { List } from 'immutable';
import { QueryClient, useQuery } from '@tanstack/react-query';
import * as Api from '../api';
import { MissingFileIdError } from '../config/errors';
import { buildAppSettingFileContentKey, buildAppSettingsKey } from '../config/keys';
import { getApiHost, getData, getDataOrThrow } from '../config/utils';
import { QueryClientConfig } from '../types';
import { convertJs } from '@graasp/sdk';
import { AppSettingRecord } from '@graasp/sdk/frontend';
import { WebsocketClient } from '../ws/ws-client';
import { configureWsAppSettingHooks } from '../ws/hooks/app';

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
  const { useAppSettingsUpdates } = configureWsAppSettingHooks(websocketClient);
  return {
    useAppSettings: (options?: { getUpdates: boolean }) => {
      const { getUpdates } = options || { getUpdates: true };
      const apiHost = getApiHost(queryClient);
      const { token, itemId } = getData(queryClient, { shouldMemberExist: false });

      const enableWs = getUpdates && queryConfig.enableWebsocket;

      useAppSettingsUpdates(enableWs ? itemId : null);

      return useQuery({
        queryKey: buildAppSettingsKey(itemId),
        queryFn: (): Promise<List<AppSettingRecord>> => {
          const { token, itemId } = getDataOrThrow(queryClient, { shouldMemberExist: false });

          return Api.getAppSettings({ itemId, token, apiHost }).then((data) => convertJs(data));
        },
        ...defaultOptions,
        enabled: Boolean(itemId) && Boolean(token),
      });
    },

    useAppSettingFile: (
      payload?: { appSettingId: string },
      { enabled = true }: { enabled?: boolean } = {},
    ) => {
      const apiHost = getApiHost(queryClient);
      const { token } = getData(queryClient, { shouldMemberExist: false });

      return useQuery({
        queryKey: buildAppSettingFileContentKey(payload?.appSettingId),
        queryFn: (): Promise<Blob> => {
          const { token } = getDataOrThrow(queryClient, { shouldMemberExist: false });

          // the following check are verified in enabled
          if (!payload?.appSettingId) {
            throw new MissingFileIdError();
          }
          const { appSettingId } = payload;
          return Api.getAppSettingFileContent({ id: appSettingId, apiHost, token }).then(
            (data) => data,
          );
        },
        ...defaultOptions,
        enabled: Boolean(payload?.appSettingId) && Boolean(token) && enabled,
      });
    },
  };
};
