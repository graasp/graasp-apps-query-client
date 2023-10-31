import { AppAction, convertJs } from '@graasp/sdk';
import { AppActionRecord } from '@graasp/sdk/frontend';

import { QueryClient, useMutation } from '@tanstack/react-query';
import { List } from 'immutable';

import * as Api from '../api';
import { MUTATION_KEYS, buildAppActionsKey } from '../config/keys';
import { getApiHost, getData, getDataOrThrow } from '../config/utils';
import { postAppActionRoutine } from '../routines';
import { QueryClientConfig } from '../types';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { enableWebsocket } = queryConfig;

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
      const newData: AppActionRecord = convertJs(newAppAction);
      // check that the websocket event has not already been received and therefore the data were added
      if (!prevData) {
        queryClient.setQueryData(key, List.of(newData));
      } else if (!prevData.some((a) => a.id === newData.id)) {
        queryClient.setQueryData(key, prevData?.push(newData));
      }
    },
    onError: (error) => {
      queryConfig?.notifier?.({
        type: postAppActionRoutine.FAILURE,
        payload: { error },
      });
    },
    onSettled: () => {
      if (!enableWebsocket) {
        const { itemId } = getData(queryClient);
        queryClient.invalidateQueries(buildAppActionsKey(itemId));
      }
    },
  });

  return {
    usePostAppAction: () =>
      useMutation<AppAction, unknown, Partial<AppAction>>(MUTATION_KEYS.POST_APP_ACTION),
  };
};
