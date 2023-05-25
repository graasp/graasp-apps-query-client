import { List } from 'immutable';
import { QueryClient, useQuery } from '@tanstack/react-query';
import * as Api from '../api';
import { MissingFileIdError } from '../config/errors';
import { buildAppContextKey, buildAppDataKey, buildFileContentKey } from '../config/keys';
import { getApiHost, getDataOrThrow } from '../config/utils';
import { AppContextRecord, QueryClientConfig } from '../types';
import { AppDataRecord } from '@graasp/sdk/frontend';
import { convertJs } from '@graasp/sdk';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };
  return {
    useAppData: (refetchInterval: number | false = false) => {
      const apiHost = getApiHost(queryClient);
      const { token, itemId } = getDataOrThrow(queryClient);
      return useQuery({
        queryKey: buildAppDataKey(itemId),
        queryFn: (): Promise<List<AppDataRecord>> => {
          return Api.getAppData({ itemId, token, apiHost }).then((data) => convertJs(data));
        },
        ...defaultOptions,
        enabled: Boolean(itemId) && Boolean(token),
        refetchInterval,
      });
    },

    useAppContext: () => {
      const apiHost = getApiHost(queryClient);
      const { token, itemId } = getDataOrThrow(queryClient, { shouldMemberExist: false });
      return useQuery({
        queryKey: buildAppContextKey(itemId),
        queryFn: (): Promise<AppContextRecord> => {
          return Api.getContext({
            itemId,
            token,
            apiHost,
          }).then((data) => convertJs(data));
        },
        ...defaultOptions,
        enabled: Boolean(itemId) && Boolean(token),
      });
    },

    useFileContent: (
      payload?: { fileId: string },
      { enabled = true }: { enabled?: boolean } = {},
    ) => {
      const apiHost = getApiHost(queryClient);
      const { token } = getDataOrThrow(queryClient);
      return useQuery({
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
      });
    },
  };
};
