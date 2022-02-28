import { List, Map } from 'immutable';
import { QueryClient, useQuery } from 'react-query';
import * as Api from '../api';
import { MissingFileIdError, MissingItemIdError, MissingTokenError } from '../config/errors';
import { buildAppContextKey, buildAppDataKey, buildFileContentKey } from '../config/keys';
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
    useAppData: (payload: { token?: string; itemId?: string }) =>
      useQuery({
        queryKey: buildAppDataKey(payload.itemId),
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
          return Api.getAppData({ itemId, token, apiHost }).then((data) => List(data));
        },
        ...defaultOptions,
        enabled: Boolean(payload.itemId) && Boolean(payload.token),
      }),

    useAppContext: (payload: { token?: string; itemId?: string }) =>
      useQuery({
        queryKey: buildAppContextKey(payload.itemId),
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
          return Api.getContext({ itemId, token, apiHost }).then((data) => Map(data));
        },
        ...defaultOptions,
        enabled: Boolean(payload.itemId) && Boolean(payload.token),
      }),

    useFileContent: (
      payload: { fileId: string; token: string; enabled: boolean },
      { enabled = true }: { enabled?: boolean } = {},
    ) =>
      useQuery({
        queryKey: buildFileContentKey(payload.fileId),
        queryFn: () => {
          const apiHost = getApiHost(queryClient);
          const { token, fileId } = payload;
          // the following check are verified in enabled
          if (!token) {
            throw new MissingTokenError();
          }
          if (!fileId) {
            throw new MissingFileIdError();
          }
          return Api.getFileContent({ id: fileId, apiHost, token }).then((data) => data);
        },
        ...defaultOptions,
        enabled: Boolean(payload.fileId) && Boolean(payload.token) && enabled,
      }),
  };
};
