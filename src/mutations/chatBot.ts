import { ChatBotMessage, GPTVersion } from '@graasp/sdk';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as Api from '../api';
import { getApiHost, getDataOrThrow } from '../config/utils';
import { postChatBotRoutine } from '../routines';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const usePostChatBot = (gptModelVersion?: GPTVersion) => {
    const queryClient = useQueryClient();
    return useMutation(
      async (payload: ChatBotMessage[]) => {
        const apiHost = getApiHost(queryClient);
        const data = getDataOrThrow(queryClient);

        return Api.postChatBot({ ...data, body: payload, apiHost, gptModelVersion });
      },
      {
        onError: (error: Error) => {
          notifier?.({
            type: postChatBotRoutine.FAILURE,
            payload: { error },
          });
        },
      },
    );
  };

  return { usePostChatBot };
};
