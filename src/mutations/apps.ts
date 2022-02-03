import { QueryClient } from 'react-query';
import { List } from 'immutable';
import * as Api from '../api';
import { buildAppDataKey, MUTATION_KEYS } from '../config/keys';
import { QueryClientConfig, AppData } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  queryClient.setMutationDefaults(MUTATION_KEYS.DELETE_APP_DATA, {
    mutationFn: (payload: { token: string; itemId: string; id: string }) =>
      Api.deleteAppData(payload, queryConfig),

    onMutate: async (payload) => {
      const prevData = queryClient.getQueryData<List<AppData>>(buildAppDataKey(payload.itemId));
      if (prevData) {
        queryClient.setQueryData(
          buildAppDataKey(payload.itemId),
          prevData?.filter(({ id: appDataId }) => appDataId !== payload.id),
        );
      }
      return prevData;
    },
    onError: (_error, payload, prevData) => {
      const data = queryClient.getQueryData<List<AppData>>(buildAppDataKey(payload.itemId));
      if (data) {
        queryClient.setQueryData(buildAppDataKey(payload.itemId), prevData);
      }
    },
    onSettled: (_data, _error, payload) => {
      queryClient.invalidateQueries(buildAppDataKey(payload.itemId));
    },
  });
};
