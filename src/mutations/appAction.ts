import { QueryClient, useMutation } from '@tanstack/react-query';
import { List } from 'immutable';
import * as Api from '../api';
import { buildAppActionsKey, MUTATION_KEYS } from '../config/keys';
import { QueryClientConfig } from '../types';
import { getApiHost, getData, getDataOrThrow } from '../config/utils';
import { postAppActionRoutine } from '../routines';
import { AppAction, convertJs } from '@graasp/sdk';
import { AppActionRecord } from '@graasp/sdk/frontend';

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
      const prevData = queryClient.getQueryData<List<AppActionRecord>>(key);
      queryClient.setQueryData(key, prevData?.push(convertJs(newAppAction)));
    },
    onError: (error) => {
      queryConfig?.notifier?.({ type: postAppActionRoutine.FAILURE, payload: { error } });
    },
    onSettled: () => {
      const { itemId } = getData(queryClient);
      queryClient.invalidateQueries(buildAppActionsKey(itemId));
    },
  });

  return {
    usePostAppAction: () =>
      useMutation<AppActionRecord, unknown, Partial<AppAction>>(MUTATION_KEYS.POST_APP_ACTION),
  };
};
