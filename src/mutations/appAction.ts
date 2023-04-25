import { QueryClient } from '@tanstack/react-query';
import { List } from 'immutable';
import * as Api from '../api';
import { buildAppActionsKey, MUTATION_KEYS } from '../config/keys';
import { AppAction, QueryClientConfig } from '../types';
import { getApiHost, getData, getDataOrThrow } from '../config/utils';
import { postAppActionRoutine } from '../routines';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
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
      queryConfig?.notifier?.({ type: postAppActionRoutine.FAILURE, payload: { error } });
    },
    onSettled: () => {
      const { itemId } = getData(queryClient);
      queryClient.invalidateQueries(buildAppActionsKey(itemId));
    },
  });
};
