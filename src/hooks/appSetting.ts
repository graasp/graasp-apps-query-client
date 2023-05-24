import { List } from 'immutable';
import { QueryClient, useQuery } from '@tanstack/react-query';
import * as Api from '../api';
import { MissingFileIdError } from '../config/errors';
import { buildAppSettingFileContentKey, buildAppSettingsKey } from '../config/keys';
import { getApiHost, getDataOrThrow } from '../config/utils';
import { QueryClientConfig } from '../types';
import { AppSetting, convertJs } from '@graasp/sdk';
import { AppSettingRecord } from '@graasp/sdk/frontend';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };
  return {
    useAppSettings: () => {
      const apiHost = getApiHost(queryClient);
      const { token, itemId } = getDataOrThrow(queryClient, { shouldMemberExist: false });
      return useQuery({
        queryKey: buildAppSettingsKey(itemId),
        queryFn: (): Promise<List<AppSettingRecord>> => {
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
      const { token } = getDataOrThrow(queryClient, { shouldMemberExist: false });
      return useQuery({
        queryKey: buildAppSettingFileContentKey(payload?.appSettingId),
        queryFn: (): Promise<Blob> => {
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
