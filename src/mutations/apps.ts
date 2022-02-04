import { QueryClient } from 'react-query';
import { List, Map, Record } from 'immutable';
import * as Api from '../api';
import { buildAppDataKey, LOCAL_CONTEXT_KEY, MUTATION_KEYS } from '../config/keys';
import { AppData, LocalContext } from '../types';
import { getApiHost, getData } from '../config/utils';

export default (queryClient: QueryClient) => {
  queryClient.setMutationDefaults(MUTATION_KEYS.POST_APP_DATA, {
    mutationFn: (payload: { data: unknown; verb: string }) => {
      const apiHost = getApiHost(queryClient);
      const data = getData(queryClient);
      return Api.postAppData({ ...data, body: payload, apiHost }).then((data) => List(data));
    },

    onSettled: () => {
      const { itemId } = getData(queryClient);
      queryClient.invalidateQueries(buildAppDataKey(itemId));
    },
  });

  queryClient.setMutationDefaults(MUTATION_KEYS.PATCH_APP_DATA, {
    mutationFn: (payload: { id: string; data: unknown }) => {
      const apiHost = getApiHost(queryClient);
      const data = getData(queryClient);
      return Api.patchAppData({ ...data, id: payload.id, data: payload.data, apiHost }).then(
        (data) => Map(data),
      );
    },

    onMutate: async (payload: { id: string; data: any }) => {
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
    onError: (_error, _payload, prevData) => {
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
      const data = getData(queryClient);
      return Api.deleteAppData({ ...data, id: payload.id, apiHost });
    },

    onMutate: async (payload) => {
      const { itemId } = getData(queryClient);
      const prevData = queryClient.getQueryData<List<AppData>>(buildAppDataKey(itemId));
      if (prevData && itemId) {
        queryClient.setQueryData(
          buildAppDataKey(itemId),
          prevData?.filter(({ id: appDataId }) => appDataId !== payload.id),
        );
      }
      return prevData;
    },
    onError: (_error, _payload, prevData) => {
      const { itemId } = getData(queryClient);
      const data = queryClient.getQueryData<List<AppData>>(buildAppDataKey(itemId));
      if (data) {
        queryClient.setQueryData(buildAppDataKey(itemId), prevData);
      }
    },
    onSettled: () => {
      const { itemId } = getData(queryClient);
      queryClient.invalidateQueries(buildAppDataKey(itemId));
    },
  });
  queryClient.setMutationDefaults(MUTATION_KEYS.PATCH_SETTINGS, {
    mutationFn: (settings: unknown) => {
      const apiHost = getApiHost(queryClient);
      const data = getData(queryClient);
      return Api.patchSettings({ ...data, settings, apiHost });
    },
    onMutate: async (payload) => {
      const prevData = queryClient.getQueryData<Record<LocalContext>>(LOCAL_CONTEXT_KEY);
      console.log('prevData: ', prevData);
      if (prevData) {
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, prevData.set('settings', payload));
      }
      return prevData;
    },
    onError: (_error, _payload, prevData) => {
      if (prevData) {
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, prevData.set('settings', prevData));
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(LOCAL_CONTEXT_KEY);
    },
  });
};
