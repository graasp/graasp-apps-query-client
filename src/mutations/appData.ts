import { AppData, Member, UUID } from '@graasp/sdk';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as Api from '../api/index.js';
import { appDataKeys } from '../config/keys.js';
import { getApiHost, getData, getDataOrThrow } from '../config/utils.js';
import {
  deleteAppDataRoutine,
  patchAppDataRoutine,
  postAppDataRoutine,
  uploadAppDataFileRoutine,
} from '../routines/index.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { notifier, enableWebsocket } = queryConfig;

  const usePostAppData = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (
        payload: Pick<AppData, 'data' | 'type'> & {
          accountId?: Member['id'];
        } & Partial<Pick<AppData, 'visibility'>>,
      ) => {
        const apiHost = getApiHost(queryClient);
        const data = getDataOrThrow(queryClient);
        return Api.postAppData({ ...data, body: payload, apiHost });
      },
      {
        onSuccess: (newData: AppData) => {
          const { itemId } = getData(queryClient);
          const key = appDataKeys.single(itemId);
          const prevData = queryClient.getQueryData<AppData[]>(key);
          if (!prevData) {
            // we need to wrap the created AppData in an array because the cache key will receive all the data but the post call only return the current posted data
            queryClient.setQueryData<AppData[]>(key, [newData]);
          } else if (!prevData.some((a) => a.id === newData.id)) {
            const newArray = [...(prevData ?? []), newData];
            queryClient.setQueryData(key, newArray);
          }
          queryConfig.notifier?.({ type: postAppDataRoutine.SUCCESS, payload: newData });
        },
        onError: (error: Error) => {
          queryConfig.notifier?.({ type: postAppDataRoutine.FAILURE, payload: { error } });
        },
        onSettled: () => {
          if (!enableWebsocket) {
            queryClient.invalidateQueries(appDataKeys.allSingles());
          }
        },
      },
    );
  };

  const usePatchAppData = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: Partial<Pick<AppData, 'visibility' | 'data'>> & { id: UUID }) => {
        const apiHost = getApiHost(queryClient);
        const data = getDataOrThrow(queryClient);
        return Api.patchAppData({ ...data, ...payload, apiHost });
      },
      {
        onMutate: async (payload) => {
          let context;
          const { itemId } = getData(queryClient);
          const prevData = queryClient.getQueryData<AppData[]>(appDataKeys.single(itemId));
          if (itemId && prevData) {
            const newData = prevData.map((appData) =>
              appData.id === payload.id ? { ...appData, ...payload } : appData,
            );
            queryClient.setQueryData(appDataKeys.single(itemId), newData);
            context = prevData;
          }
          return context;
        },
        onSuccess: (newAppData) => {
          queryConfig?.notifier?.({ type: patchAppDataRoutine.SUCCESS, payload: newAppData });
        },
        onError: (error: Error, _payload, prevData) => {
          queryConfig?.notifier?.({ type: patchAppDataRoutine.FAILURE, payload: { error } });

          if (prevData) {
            const { itemId } = getData(queryClient);
            const data = queryClient.getQueryData<AppData[]>(appDataKeys.single(itemId));
            if (itemId && data) {
              queryClient.setQueryData(appDataKeys.single(itemId), prevData);
            }
          }
        },
        onSettled: () => {
          if (!enableWebsocket) {
            queryClient.invalidateQueries(appDataKeys.allSingles());
          }
        },
      },
    );
  };

  const useDeleteAppData = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: { id: AppData['id'] }) => {
        const apiHost = getApiHost(queryClient);
        const data = getDataOrThrow(queryClient);
        return Api.deleteAppData({ ...data, id: payload.id, apiHost });
      },
      {
        onMutate: async (payload) => {
          const { itemId } = getDataOrThrow(queryClient);
          const prevData = queryClient.getQueryData<AppData[]>(appDataKeys.single(itemId));
          if (prevData && itemId) {
            queryClient.setQueryData(
              appDataKeys.single(itemId),
              prevData?.filter(({ id: appDataId }) => appDataId !== payload.id),
            );
          }
          return prevData;
        },
        onSuccess: (prevData) => {
          queryConfig?.notifier?.({ type: deleteAppDataRoutine.SUCCESS, payload: prevData });
        },
        onError: (error: Error, _payload, prevData) => {
          queryConfig?.notifier?.({ type: deleteAppDataRoutine.FAILURE, payload: { error } });
          if (prevData) {
            const { itemId } = getData(queryClient);
            const data = queryClient.getQueryData<AppData[]>(appDataKeys.single(itemId));
            if (itemId && data) {
              queryClient.setQueryData(appDataKeys.single(itemId), prevData);
            }
          }
        },
        onSettled: () => {
          const { itemId } = getData(queryClient);
          if (itemId && !enableWebsocket) {
            queryClient.invalidateQueries(appDataKeys.allSingles());
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
  const useUploadAppDataFile = () => {
    const queryClient = useQueryClient();
    return useMutation(
      async ({ error }: { error?: Error; data?: unknown }) => {
        if (error) throw new Error(JSON.stringify(error));
      },
      {
        onSuccess: (_result, { data, error }) => {
          if (error) {
            throw error;
          } else {
            notifier?.({ type: uploadAppDataFileRoutine.SUCCESS, payload: { data } });
          }
        },
        onError: (_error, { error }) => {
          notifier?.({ type: uploadAppDataFileRoutine.FAILURE, payload: { error } });
        },
        onSettled: () => {
          const { itemId } = getData(queryClient);
          if (itemId) {
            queryClient.invalidateQueries(appDataKeys.allSingles());
          }
        },
      },
    );
  };

  return { usePostAppData, usePatchAppData, useDeleteAppData, useUploadAppDataFile };
};
