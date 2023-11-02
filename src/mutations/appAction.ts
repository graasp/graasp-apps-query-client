import { AppAction } from '@graasp/sdk';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as Api from '../api';
import { buildAppActionsKey } from '../config/keys';
import { getApiHost, getData, getDataOrThrow } from '../config/utils';
import { postAppActionRoutine } from '../routines';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { enableWebsocket } = queryConfig;

  const usePostAppAction = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: Partial<AppAction>) => {
        const apiHost = getApiHost(queryClient);
        const data = getDataOrThrow(queryClient);
        return Api.postAppAction({ ...data, body: payload, apiHost });
      },
      {
        onSuccess: (newAppAction: AppAction) => {
          const { itemId } = getData(queryClient);
          const key = buildAppActionsKey(itemId);
          const prevData = queryClient.getQueryData<AppAction[]>(key);
          const newData: AppAction = newAppAction;
          // check that the websocket event has not already been received and therefore the data were added
          if (!prevData) {
            queryClient.setQueryData(key, newData);
          } else if (!prevData.some((a) => a.id === newData.id)) {
            queryClient.setQueryData(key, [...(prevData ?? []), newData]);
          }
        },
        onError: (error: Error) => {
          queryConfig?.notifier?.({ type: postAppActionRoutine.FAILURE, payload: { error } });
        },
        onSettled: () => {
          if (!enableWebsocket) {
            const { itemId } = getData(queryClient);
            queryClient.invalidateQueries(buildAppActionsKey(itemId));
          }
        },
      },
    );
  };

  return { usePostAppAction };
};
