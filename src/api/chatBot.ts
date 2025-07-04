import { ChatBotMessage, GPTVersionType } from '@graasp/sdk';

import { ApiData, ChatBotCompletion } from '../types.js';
import configureAxios from './axios.js';
import { buildPostChatBotRoute } from './routes.js';

const axios = configureAxios();

export const postChatBot = (
  args: ApiData & {
    body: ChatBotMessage[];
    gptModelVersion?: GPTVersionType;
  },
) => {
  const { token, itemId, apiHost, body, gptModelVersion } = args;
  const url = new URL(buildPostChatBotRoute(itemId), apiHost);
  if (gptModelVersion) {
    url.searchParams.set('gptVersion', gptModelVersion);
  }
  return axios
    .post<ChatBotCompletion>(url.toString(), body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
};
