import { QueryClient, useMutation } from '@tanstack/react-query';
import { List } from 'immutable';
import * as Api from '../api';
import { buildAppDataKey, MUTATION_KEYS } from '../config/keys';
import { QueryClientConfig } from '../types';
import { getApiHost, getData, getDataOrThrow } from '../config/utils';
import {
  deleteAppDataRoutine,
  patchAppDataRoutine,
  postAppDataRoutine,
  uploadAppDataFileRoutine,
} from '../routines';
import { AppData, UUID, convertJs } from '@graasp/sdk';
import { AppDataRecord } from '@graasp/sdk/frontend';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier, enableWebsocket } = queryConfig;

  queryClient.setMutationDefaults(MUTATION_KEYS.POST_APP_DATA, {
    mutationFn: (payload: Partial<AppData>) => {
      const apiHost = getApiHost(queryClient);
      const data = getDataOrThrow(queryClient);
      return Api.postAppData({ ...data, body: payload, apiHost });
    },
    onSuccess: (newAppData: AppData) => {
      const { itemId } = getData(queryClient);
      const key = buildAppDataKey(itemId);
      const prevData = queryClient.getQueryData<List<AppDataRecord>>(key);
      const newData = convertJs(newAppData);
      if (!enableWebsocket) queryClient.setQueryData(key, prevData?.push(newData));
      queryConfig?.notifier?.({ type: postAppDataRoutine.SUCCESS, payload: newData });
    },
    onError: (error) => {
      queryConfig?.notifier?.({ type: postAppDataRoutine.FAILURE, payload: { error } });
    },
    onSettled: () => {
      if (!enableWebsocket) {
        const { itemId } = getData(queryClient);
        queryClient.invalidateQueries(buildAppDataKey(itemId));
      }
    },
  });
  const usePostAppData = () =>
    useMutation<AppData, unknown, Partial<AppData>>(MUTATION_KEYS.POST_APP_DATA);

  queryClient.setMutationDefaults(MUTATION_KEYS.PATCH_APP_DATA, {
    mutationFn: (payload: Partial<AppData> & { id: UUID }) => {
      const apiHost = getApiHost(queryClient);
      const data = getDataOrThrow(queryClient);
      return Api.patchAppData({ ...data, ...payload, apiHost });
    },
    onMutate: async (payload) => {
      let context = null;
      const { itemId } = getData(queryClient);
      const prevData = queryClient.getQueryData<List<AppDataRecord>>(buildAppDataKey(itemId));
      if (itemId && prevData) {
        const newData = prevData.map((appData) =>
          appData.id === payload.id ? appData.merge(convertJs(payload)) : appData,
        );
        queryClient.setQueryData(buildAppDataKey(itemId), newData);
        context = prevData;
      }
      return context;
    },
    onSuccess: (newAppData) => {
      queryConfig?.notifier?.({ type: patchAppDataRoutine.SUCCESS, payload: newAppData });
      // TODO: Implement local patching mecanism
    },
    onError: (error, _payload, prevData) => {
      queryConfig?.notifier?.({ type: patchAppDataRoutine.FAILURE, payload: { error } });

      if (prevData) {
        const { itemId } = getData(queryClient);
        const data = queryClient.getQueryData<List<AppDataRecord>>(buildAppDataKey(itemId));
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
  });

  /**
   * @description
   * By using the `merge` method in the `onMutate` callback, the payload should be a clean object, free of attributes from the `Record` type
   * from Immutable.js. Therefore, when using this mutation, one must be careful not to use object spreading
   * of the `data` attribute found in the `AppDataRecord`. I believe this may break some apps.
   *
   * @example Working example
   * ```
   * const { id, data } = appData; // type: AppDataRecord
   * // data: { text: string, count: number }
   * patchAppData({
   *  id,
   *  data: {
   *    count: data.count,
   *    text: newContent,
   *  },
   * });
   * ```
   *
   * @example Failing example
   * ```
   * const { id, data } = appData; // type: AppDataRecord
   * // data: { text: string, count: number }
   * patchAppData({
   *  id,
   *  data: {
   *    ...data,
   *    text: newContent,
   *  },
   * });
   * ```
   *
   */
  const usePatchAppData = () =>
    useMutation<AppData, unknown, Partial<AppData>>(MUTATION_KEYS.PATCH_APP_DATA);

  queryClient.setMutationDefaults(MUTATION_KEYS.DELETE_APP_DATA, {
    mutationFn: (payload: { id: string }) => {
      const apiHost = getApiHost(queryClient);
      const data = getDataOrThrow(queryClient);
      return Api.deleteAppData({ ...data, id: payload.id, apiHost });
    },
    onMutate: async (payload) => {
      const { itemId } = getDataOrThrow(queryClient);
      const prevData = queryClient.getQueryData<List<AppDataRecord>>(buildAppDataKey(itemId));
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
    onError: (error, _payload, prevData) => {
      queryConfig?.notifier?.({ type: deleteAppDataRoutine.FAILURE, payload: { error } });
      if (prevData) {
        const { itemId } = getData(queryClient);
        const data = queryClient.getQueryData<List<AppDataRecord>>(buildAppDataKey(itemId));
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
  });
  const useDeleteAppData = () =>
    useMutation<AppData, unknown, { id: string }>(MUTATION_KEYS.DELETE_APP_DATA);

  // this mutation is used for its callback and invalidate the keys
  /**
   * @param {UUID} id parent item id wher the file is uploaded in
   * @param {error} [error] error occured during the file uploading
   */
  queryClient.setMutationDefaults(MUTATION_KEYS.FILE_UPLOAD, {
    mutationFn: async ({ error }) => {
      if (error) throw new Error(JSON.stringify(error));
    },
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
  });
  const useUploadAppDataFile = () =>
    useMutation<unknown, unknown, { error?: unknown; data?: unknown }>(MUTATION_KEYS.FILE_UPLOAD);

  return { usePostAppData, usePatchAppData, useDeleteAppData, useUploadAppDataFile };
};
