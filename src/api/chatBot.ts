import { ChatBotMessage, GPTVersion } from '@graasp/sdk';

import { ApiData, ChatBotCompletion } from 'types';

import configureAxios from './axios';
import { buildPostChatBotRoute } from './routes';

const axios = configureAxios();

export const postChatBot = (
  args: ApiData & {
    body: ChatBotMessage[];
    gptModelVersion?: GPTVersion;
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
