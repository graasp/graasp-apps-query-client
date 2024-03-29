import { ChatBotMessage } from '@graasp/sdk';

import { ApiData, ChatBotCompletion } from 'types';

import configureAxios from './axios';
import { buildPostChatBotRoute } from './routes';

const axios = configureAxios();

export const postChatBot = (
  args: ApiData & {
    body: ChatBotMessage[];
  },
) => {
  const { token, itemId, apiHost, body } = args;
  return axios
    .post<ChatBotCompletion>(`${apiHost}/${buildPostChatBotRoute(itemId)}`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
};
