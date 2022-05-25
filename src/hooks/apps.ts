import { List, Map } from 'immutable';
import { QueryClient, useQuery } from 'react-query';
import * as Api from '../api';
import { MissingFileIdError } from '../config/errors';
import {
  buildAppActionsKey,
  buildAppContextKey,
  buildAppDataKey,
  buildFileContentKey,
} from '../config/keys';
import { getApiHost, getDataOrThrow } from '../config/utils';
import { QueryClientConfig } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };
  return {
    useAppData: (
      refetchInterval: number | false = false,
    ) => {
      const apiHost = getApiHost(queryClient);
      const { token, itemId } = getDataOrThrow(queryClient);
      return useQuery({
        queryKey: buildAppDataKey(itemId),
        queryFn: () => {
          return Api.getAppData({ itemId, token, apiHost }).then((data) => List(data));
        },
        ...defaultOptions,
        enabled: Boolean(itemId) && Boolean(token),
        refetchInterval,
      })
    },

    useAppActions: () => {
      const apiHost = getApiHost(queryClient);
      const { token, itemId } = getDataOrThrow(queryClient);

      return useQuery({
        queryKey: buildAppActionsKey(itemId),
        queryFn: () => {
          return Api.getAppActions({ itemId, token, apiHost }).then((data) => List(data));
        },
        ...defaultOptions,
        enabled: Boolean(itemId) && Boolean(token),
      });
    },

    useAppContext: () => {
      const apiHost = getApiHost(queryClient);
      const { token, itemId } = getDataOrThrow(queryClient);
      useQuery({
        queryKey: buildAppContextKey(itemId),
        queryFn: () => {
          return Api.getContext({ itemId, token, apiHost }).then((data) => Map(data));
        },
        ...defaultOptions,
        enabled: Boolean(itemId) && Boolean(token),
      })
    },

    useFileContent: (
      payload?: { fileId: string; },
      { enabled = true }: { enabled?: boolean } = {},
    ) => {
      const apiHost = getApiHost(queryClient);
      const { token } = getDataOrThrow(queryClient);
      useQuery({
        queryKey: buildFileContentKey(payload?.fileId),
        queryFn: () => {
          if (!payload?.fileId) {
            throw new MissingFileIdError();
          }
          const { fileId } = payload;
          return Api.getFileContent({ id: fileId, apiHost, token }).then((data) => data);
        },
        ...defaultOptions,
        enabled: Boolean(payload?.fileId) && Boolean(token) && enabled,
      })
    },
  };
};
