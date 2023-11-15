import { ApiData, ChatBotCompletion } from 'src/types';
import configureAxios from './axios';
import { buildPostChatBotRoute } from './routes';
import { ChatBotMessage } from '@graasp/sdk';

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
