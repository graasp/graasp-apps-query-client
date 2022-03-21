import { List, Map } from 'immutable';
import { QueryClient, useQuery } from 'react-query';
import * as Api from '../api';
import { MissingFileIdError, MissingItemIdError, MissingTokenError } from '../config/errors';
import {
  buildAppActionKey,
  buildAppContextKey,
  buildAppDataKey,
  buildFileContentKey,
} from '../config/keys';
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
    useAppData: (payload: { token?: string; itemId?: string }, refetchInterval: number | false = false) =>
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
        refetchInterval,
      }),

    useAppActions: (payload: { token?: string; itemId?: string }) =>
      useQuery({
        queryKey: buildAppActionKey(payload.itemId),
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
          return Api.getAppActions({ itemId, token, apiHost }).then((data) => List(data));
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
      payload?: { fileId: string; token: string },
      { enabled = true }: { enabled?: boolean } = {},
    ) =>
      useQuery({
        queryKey: buildFileContentKey(payload?.fileId),
        queryFn: () => {
          const apiHost = getApiHost(queryClient);
          // the following check are verified in enabled
          if (!payload?.token) {
            throw new MissingTokenError();
          }
          if (!payload?.fileId) {
            throw new MissingFileIdError();
          }
          const { token, fileId } = payload;
          return Api.getFileContent({ id: fileId, apiHost, token }).then((data) => data);
        },
        ...defaultOptions,
        enabled: Boolean(payload?.fileId) && Boolean(payload?.token) && enabled,
      }),
  };
};
