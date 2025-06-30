import { ChatBotMessage, GPTVersionType } from '@graasp/sdk';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as Api from '../api/index.js';
import { getApiHost, getDataOrThrow } from '../config/utils.js';
import { postChatBotRoutine } from '../routines/index.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const usePostChatBot = (gptModelVersion?: GPTVersionType) => {
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
