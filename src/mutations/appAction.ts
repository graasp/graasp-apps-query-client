import { AppAction } from '@graasp/sdk';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as Api from '../api/index.js';
import { appActionKeys } from '../config/keys.js';
import { getApiHost, getData, getDataOrThrow } from '../config/utils.js';
import { postAppActionRoutine } from '../routines/index.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { enableWebsocket } = queryConfig;

  const usePostAppAction = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (payload: Pick<AppAction, 'type' | 'data'>) => {
        const apiHost = getApiHost(queryClient);
        const data = getDataOrThrow(queryClient);
        return Api.postAppAction({ ...data, body: payload, apiHost });
      },
      {
        onSuccess: (newAppAction: AppAction) => {
          const { itemId } = getData(queryClient);
          const key = appActionKeys.single(itemId);
          const prevData = queryClient.getQueryData<AppAction[]>(key);
          const newData: AppAction = newAppAction;
          // check that the websocket event has not already been received and therefore the data were added
          if (!prevData) {
            // we need to wrap the created appAction in an array because the cache key will receive all the actions but the post call only return the current posted data
            queryClient.setQueryData<AppAction[]>(key, [newData]);
          } else if (!prevData.some((a) => a.id === newData.id)) {
            queryClient.setQueryData(key, [...(prevData ?? []), newData]);
          }
        },
        onError: (error: Error) => {
          queryConfig?.notifier?.({ type: postAppActionRoutine.FAILURE, payload: { error } });
        },
        onSettled: () => {
          if (!enableWebsocket) {
            queryClient.invalidateQueries(appActionKeys.allSingles());
          }
        },
      },
    );
  };

  return { usePostAppAction };
};
