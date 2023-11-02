import { AppData, Member, UUID } from '@graasp/sdk';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as Api from '../api';
import { buildAppDataKey } from '../config/keys';
import { getApiHost, getData, getDataOrThrow } from '../config/utils';
import {
  deleteAppDataRoutine,
  patchAppDataRoutine,
  postAppDataRoutine,
  uploadAppDataFileRoutine,
} from '../routines';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { notifier, enableWebsocket } = queryConfig;

  const usePostAppData = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (
        payload: Pick<AppData, 'data' | 'type'> & { memberId?: Member['id'] } & Partial<
            Pick<AppData, 'visibility'>
          >,
      ) => {
        const apiHost = getApiHost(queryClient);
        const data = getDataOrThrow(queryClient);
        return Api.postAppData({ ...data, body: payload, apiHost });
      },
      {
        onSuccess: (newAppData: AppData) => {
          const { itemId } = getData(queryClient);
          const key = buildAppDataKey(itemId);
          const prevData = queryClient.getQueryData<AppData[]>(key);
          const newData: AppData = newAppData;
          if (!prevData) {
            queryClient.setQueryData(key, newData);
          } else if (!prevData.some((a) => a.id === newData.id)) {
            const newArray = [...(prevData ?? []), newData];
            queryClient.setQueryData(key, newArray);
          }
          queryConfig?.notifier?.({ type: postAppDataRoutine.SUCCESS, payload: newData });
        },
        onError: (error: Error) => {
          queryConfig?.notifier?.({ type: postAppDataRoutine.FAILURE, payload: { error } });
        },
        onSettled: () => {
          if (!enableWebsocket) {
            const { itemId } = getData(queryClient);
            queryClient.invalidateQueries(buildAppDataKey(itemId));
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
          const prevData = queryClient.getQueryData<AppData[]>(buildAppDataKey(itemId));
          if (itemId && prevData) {
            const newData = prevData.map((appData) =>
              appData.id === payload.id ? { ...appData, ...payload } : appData,
            );
            queryClient.setQueryData(buildAppDataKey(itemId), newData);
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
            const data = queryClient.getQueryData<AppData[]>(buildAppDataKey(itemId));
            if (itemId && data) {
              queryClient.setQueryData(buildAppDataKey(itemId), prevData);
            }
          }
        },
        onSettled: () => {
          if (!enableWebsocket) {
            const data = getData(queryClient);
            queryClient.invalidateQueries(buildAppDataKey(data?.itemId));
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
          const prevData = queryClient.getQueryData<AppData[]>(buildAppDataKey(itemId));
          if (prevData && itemId) {
            queryClient.setQueryData(
              buildAppDataKey(itemId),
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
            const data = queryClient.getQueryData<AppData[]>(buildAppDataKey(itemId));
            if (itemId && data) {
              queryClient.setQueryData(buildAppDataKey(itemId), prevData);
            }
          }
        },
        onSettled: () => {
          const { itemId } = getData(queryClient);
          if (itemId && !enableWebsocket) {
            queryClient.invalidateQueries(buildAppDataKey(itemId));
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
            queryClient.invalidateQueries(buildAppDataKey(itemId));
          }
        },
      },
    );
  };

  return { usePostAppData, usePatchAppData, useDeleteAppData, useUploadAppDataFile };
};
