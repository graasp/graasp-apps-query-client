import { AppSetting } from '@graasp/sdk';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as Api from '../api';
import { appSettingKeys } from '../config/keys';
import { getApiHost, getData, getDataOrThrow } from '../config/utils';
import {
  deleteAppSettingRoutine,
  patchAppSettingRoutine,
  postAppSettingRoutine,
  uploadAppSettingFileRoutine,
} from '../routines';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { notifier, enableWebsocket } = queryConfig;

  const usePostAppSetting = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: Partial<AppSetting>) => {
        const apiHost = getApiHost(queryClient);
        const data = getDataOrThrow(queryClient);
        return Api.postAppSetting({ ...data, body: payload, apiHost });
      },
      {
        onSuccess: (newAppSetting: AppSetting) => {
          queryConfig?.notifier?.({ type: postAppSettingRoutine.SUCCESS, payload: newAppSetting });
        },
        onError: (error: Error) => {
          queryConfig?.notifier?.({ type: postAppSettingRoutine.FAILURE, payload: { error } });
        },
        onSettled: () => {
          // only invalidate when websockets are disabled (ws update the cache when they are enabled)
          if (!enableWebsocket) {
            // invalidate all appSettings queries that depend on a single id
            queryClient.invalidateQueries(appSettingKeys.single());
          }
        },
      },
    );
  };

  const usePatchAppSetting = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: Partial<AppSetting> & { id: string }) => {
        const apiHost = getApiHost(queryClient);
        const data = getDataOrThrow(queryClient);
        return Api.patchAppSetting({ ...data, id: payload.id, data: payload.data, apiHost });
      },
      {
        onMutate: async (payload) => {
          let context;
          const { itemId } = getData(queryClient);
          const prevData = queryClient.getQueryData<AppSetting[]>(appSettingKeys.singleId(itemId));
          if (itemId && prevData) {
            const newData = prevData.map((appData) =>
              appData.id === payload.id ? { ...appData, ...payload } : appData,
            );
            queryClient.setQueryData(appSettingKeys.singleId(itemId), newData);
            context = prevData;
          }
          return context;
        },
        onSuccess: (newData) => {
          queryConfig?.notifier?.({ type: postAppSettingRoutine.SUCCESS, payload: newData });
        },
        onError: (error: Error, _payload, prevData) => {
          queryConfig?.notifier?.({ type: patchAppSettingRoutine.FAILURE, payload: { error } });

          if (prevData) {
            const { itemId } = getData(queryClient);
            const data = queryClient.getQueryData<AppSetting[]>(appSettingKeys.singleId(itemId));
            if (itemId && data) {
              queryClient.setQueryData(appSettingKeys.singleId(itemId), prevData);
            }
          }
        },
        onSettled: () => {
          if (!enableWebsocket) {
            queryClient.invalidateQueries(appSettingKeys.single());
          }
        },
      },
    );
  };

  const useDeleteAppSetting = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: { id: string }) => {
        const apiHost = getApiHost(queryClient);
        const data = getDataOrThrow(queryClient);
        return Api.deleteAppSetting({ ...data, id: payload.id, apiHost });
      },
      {
        onMutate: async (payload) => {
          const { itemId } = getDataOrThrow(queryClient);
          const prevData = queryClient.getQueryData<AppSetting[]>(appSettingKeys.singleId(itemId));
          if (prevData && itemId) {
            queryClient.setQueryData(
              appSettingKeys.singleId(itemId),
              prevData?.filter(({ id: appDataId }) => appDataId !== payload.id),
            );
          }
          return prevData;
        },
        onSuccess: (prevData) => {
          queryConfig?.notifier?.({ type: deleteAppSettingRoutine.SUCCESS, payload: prevData });
        },
        onError: (error: Error, _payload, prevData) => {
          queryConfig?.notifier?.({ type: deleteAppSettingRoutine.FAILURE, payload: { error } });

          if (prevData) {
            const { itemId } = getData(queryClient);
            const data = queryClient.getQueryData<AppSetting[]>(appSettingKeys.singleId(itemId));
            if (itemId && data) {
              queryClient.setQueryData(appSettingKeys.singleId(itemId), prevData);
            }
          }
        },
        onSettled: () => {
          if (!enableWebsocket) {
            const { itemId } = getData(queryClient);
            if (itemId) {
              queryClient.invalidateQueries(appSettingKeys.single());
            }
          }
        },
      },
    );
  };

  // this mutation is used for its callback and invalidate the keys
  /**
   * @param {UUID} id parent item id where the file is uploaded in
   * @param {error} [error] error occurred during the file uploading
   */
  const useUploadAppSettingFile = () => {
    const queryClient = useQueryClient();
    return useMutation(
      async ({ error }: { data?: unknown; error?: Error }) => {
        if (error) throw new Error(JSON.stringify(error));
      },
      {
        onSuccess: (_result, { data, error }) => {
          if (error) {
            throw error;
          } else {
            notifier?.({ type: uploadAppSettingFileRoutine.SUCCESS, payload: { data } });
          }
        },
        onError: (_error, { error }) => {
          notifier?.({ type: uploadAppSettingFileRoutine.FAILURE, payload: { error } });
        },
        onSettled: () => {
          const { itemId } = getData(queryClient);
          if (itemId) {
            queryClient.invalidateQueries(appSettingKeys.single());
          }
        },
      },
    );
  };

  return { usePostAppSetting, usePatchAppSetting, useDeleteAppSetting, useUploadAppSettingFile };
};
