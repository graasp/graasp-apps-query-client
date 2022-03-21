import { List } from 'immutable';
import { QueryClient, useQuery } from 'react-query';
import * as Api from '../api';
import { MissingFileIdError, MissingItemIdError, MissingTokenError } from '../config/errors';
import { buildAppSettingFileContentKey, buildAppSettingsKey } from '../config/keys';
import { getApiHost } from '../config/utils';
import { QueryClientConfig } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };
  return {
    useAppSettings: (payload: { token?: string; itemId?: string }) =>
      useQuery({
        queryKey: buildAppSettingsKey(payload.itemId),
        queryFn: () => {
          const apiHost = getApiHost(queryClient);
          const { token, itemId } = payload;
          // the following check are verified in enabled
          if (!token) {
            throw new MissingTokenError();
          }
          if (!itemId) {
            throw new MissingItemIdError();
          }
          return Api.getAppSettings({ itemId, token, apiHost }).then((data) => List(data));
        },
        ...defaultOptions,
        enabled: Boolean(payload.itemId) && Boolean(payload.token),
      }),

    useAppSettingFile: (
      payload?: { appSettingId: string; token: string },
      { enabled = true }: { enabled?: boolean } = {},
    ) =>
      useQuery({
        queryKey: buildAppSettingFileContentKey(payload?.appSettingId),
        queryFn: () => {
          const apiHost = getApiHost(queryClient);
          // the following check are verified in enabled
          if (!payload?.token) {
            throw new MissingTokenError();
          }
          if (!payload?.appSettingId) {
            throw new MissingFileIdError();
          }
          const { token, appSettingId } = payload;
          return Api.getAppSettingFileContent({ id: appSettingId, apiHost, token }).then(
            (data) => data,
          );
        },
        ...defaultOptions,
        enabled: Boolean(payload?.appSettingId) && Boolean(payload?.token) && enabled,
      }),
  };
};
