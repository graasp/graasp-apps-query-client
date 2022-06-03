import { QueryClient } from 'react-query';
import { List, Map } from 'immutable';
import * as Api from '../api';
import { buildAppActionsKey, buildAppDataKey, MUTATION_KEYS } from '../config/keys';
import { AppAction, AppData, QueryClientConfig, UUID } from '../types';
import { getApiHost, getData, getDataOrThrow } from '../config/utils';
import {
  deleteAppDataRoutine,
  patchAppDataRoutine,
  postAppDataRoutine,
  uploadFileRoutine,
} from '../routines';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(MUTATION_KEYS.POST_APP_DATA, {
    mutationFn: (payload: Partial<AppData>) => {
      const apiHost = getApiHost(queryClient);
      const data = getDataOrThrow(queryClient);
      return Api.postAppData({ ...data, body: payload, apiHost });
    },
    onSuccess: (newAppData: AppData) => {
      const { itemId } = getData(queryClient);
      const key = buildAppDataKey(itemId);
      const prevData = queryClient.getQueryData<List<AppData>>(key);
      queryClient.setQueryData(key, prevData?.push(newAppData));
    },
    onError: (error) => {
      queryConfig?.notifier?.({ type: postAppDataRoutine.FAILURE, payload: { error } });
    },
    onSettled: () => {
      const { itemId } = getData(queryClient);
      queryClient.invalidateQueries(buildAppDataKey(itemId));
    },
  });

  queryClient.setMutationDefaults(MUTATION_KEYS.PATCH_APP_DATA, {
    mutationFn: (payload: Partial<AppData> & { id: UUID }) => {
      const apiHost = getApiHost(queryClient);
      const data = getDataOrThrow(queryClient);
      return Api.patchAppData({ ...data, ...payload, apiHost }).then((data) => Map(data));
    },
    onMutate: async (payload) => {
      let context = null;
      const { itemId } = getData(queryClient);
      const prevData = queryClient.getQueryData<List<AppData>>(buildAppDataKey(itemId));
      if (itemId && prevData) {
        const newData = prevData.map((appData) =>
          appData.id === payload.id
            ? { ...appData, data: { ...appData.data, ...payload.data } }
            : appData,
        );
        queryClient.setQueryData(buildAppDataKey(itemId), newData);
        context = prevData;
      }
      return context;
    },
    onError: (error, _payload, prevData) => {
      queryConfig?.notifier?.({ type: patchAppDataRoutine.FAILURE, payload: { error } });

      if (prevData) {
        const { itemId } = getData(queryClient);
        const data = queryClient.getQueryData<List<AppData>>(buildAppDataKey(itemId));
        if (itemId && data) {
          queryClient.setQueryData(buildAppDataKey(itemId), prevData);
        }
      }
    },
    onSettled: () => {
      const data = getData(queryClient);
      queryClient.invalidateQueries(buildAppDataKey(data?.itemId));
    },
  });

  queryClient.setMutationDefaults(MUTATION_KEYS.DELETE_APP_DATA, {
    mutationFn: (payload: { id: string }) => {
      const apiHost = getApiHost(queryClient);
      const data = getDataOrThrow(queryClient);
      return Api.deleteAppData({ ...data, id: payload.id, apiHost });
    },
    onMutate: async (payload) => {
      const { itemId } = getDataOrThrow(queryClient);
      const prevData = queryClient.getQueryData<List<AppData>>(buildAppDataKey(itemId));
      if (prevData && itemId) {
        queryClient.setQueryData(
          buildAppDataKey(itemId),
          prevData?.filter(({ id: appDataId }) => appDataId !== payload.id),
        );
      }
      return prevData;
    },
    onError: (error, _payload, prevData) => {
      queryConfig?.notifier?.({ type: deleteAppDataRoutine.FAILURE, payload: { error } });

      if (prevData) {
        const { itemId } = getData(queryClient);
        const data = queryClient.getQueryData<List<AppData>>(buildAppDataKey(itemId));
        if (itemId && data) {
          queryClient.setQueryData(buildAppDataKey(itemId), prevData);
        }
      }
    },
    onSettled: () => {
      const { itemId } = getData(queryClient);
      if (itemId) {
        queryClient.invalidateQueries(buildAppDataKey(itemId));
      }
    },
  });

  queryClient.setMutationDefaults(MUTATION_KEYS.POST_APP_ACTION, {
    mutationFn: (payload: Partial<AppAction>) => {
      const apiHost = getApiHost(queryClient);
      const data = getDataOrThrow(queryClient);
      return Api.postAppAction({ ...data, body: payload, apiHost });
    },
    onSuccess: (newAppAction: AppAction) => {
      const { itemId } = getData(queryClient);
      const key = buildAppActionsKey(itemId);
      const prevData = queryClient.getQueryData<List<AppAction>>(key);
      queryClient.setQueryData(key, prevData?.push(newAppAction));
    },
    onError: (error) => {
      queryConfig?.notifier?.({ type: postAppDataRoutine.FAILURE, payload: { error } });
    },
    onSettled: () => {
      const { itemId } = getData(queryClient);
      queryClient.invalidateQueries(buildAppActionsKey(itemId));
    },
  });
  // this mutation is used for its callback and invalidate the keys
  /**
   * @param {UUID} id parent item id wher the file is uploaded in
   * @param {error} [error] error occured during the file uploading
   */
  queryClient.setMutationDefaults(MUTATION_KEYS.FILE_UPLOAD, {
    mutationFn: async ({ error }) => {
      if (error) throw new Error(JSON.stringify(error));
    },
    onSuccess: (_result, { data }: { data: AppData }) => {
      const { itemId } = getData(queryClient);
      if (itemId) {
        const key = buildAppDataKey(itemId);
        const prevData = queryClient.getQueryData<List<AppData>>(key);
        if (prevData && data) {
          queryClient.setQueryData(key, prevData.concat(data));
        }
      }
      notifier?.({ type: uploadFileRoutine.SUCCESS });
    },
    onError: (_error, { error }) => {
      notifier?.({ type: uploadFileRoutine.FAILURE, payload: { error } });
    },
    onSettled: () => {
      const { itemId } = getData(queryClient);
      if (itemId) {
        queryClient.invalidateQueries(buildAppDataKey(itemId));
      }
    },
  });
};
