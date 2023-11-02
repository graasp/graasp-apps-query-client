import { AppSetting } from '@graasp/sdk';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as Api from '../api';
import { buildAppSettingsKey } from '../config/keys';
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
          const { itemId } = getData(queryClient);
          const key = buildAppSettingsKey(itemId);
          const prevData = queryClient.getQueryData<AppSetting[]>(key);
          const newData: AppSetting = newAppSetting;
          if (!prevData) {
            queryClient.setQueryData(key, newData);
          } else if (!prevData.some((a) => a.id === newData.id)) {
            queryClient.setQueryData(key, [...(prevData ?? []), newData]);
          }
          queryConfig?.notifier?.({ type: postAppSettingRoutine.SUCCESS, payload: newData });
        },
        onError: (error: Error) => {
          queryConfig?.notifier?.({ type: postAppSettingRoutine.FAILURE, payload: { error } });
        },
        onSettled: () => {
          if (!enableWebsocket) {
            const { itemId } = getData(queryClient);
            queryClient.invalidateQueries(buildAppSettingsKey(itemId));
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
          const prevData = queryClient.getQueryData<AppSetting[]>(buildAppSettingsKey(itemId));
          if (itemId && prevData) {
            const newData = prevData.map((appData) =>
              appData.id === payload.id ? { ...appData, ...payload } : appData,
            );
            queryClient.setQueryData(buildAppSettingsKey(itemId), newData);
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
            const data = queryClient.getQueryData<AppSetting[]>(buildAppSettingsKey(itemId));
            if (itemId && data) {
              queryClient.setQueryData(buildAppSettingsKey(itemId), prevData);
            }
          }
        },
        onSettled: () => {
          if (!enableWebsocket) {
            const data = getData(queryClient);
            queryClient.invalidateQueries(buildAppSettingsKey(data?.itemId));
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
          const prevData = queryClient.getQueryData<AppSetting[]>(buildAppSettingsKey(itemId));
          if (prevData && itemId) {
            queryClient.setQueryData(
              buildAppSettingsKey(itemId),
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
            const data = queryClient.getQueryData<AppSetting[]>(buildAppSettingsKey(itemId));
            if (itemId && data) {
              queryClient.setQueryData(buildAppSettingsKey(itemId), prevData);
            }
          }
        },
        onSettled: () => {
          if (!enableWebsocket) {
            const { itemId } = getData(queryClient);
            if (itemId) {
              queryClient.invalidateQueries(buildAppSettingsKey(itemId));
            }
          }
        },
      },
    );
  };

  // this mutation is used for its callback and invalidate the keys
  /**
   * @param {UUID} id parent item id wher the file is uploaded in
   * @param {error} [error] error occured during the file uploading
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
            queryClient.invalidateQueries(buildAppSettingsKey(itemId));
          }
        },
      },
    );
  };

  return { usePostAppSetting, usePatchAppSetting, useDeleteAppSetting, useUploadAppSettingFile };
};
