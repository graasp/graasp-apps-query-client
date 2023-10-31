import { useContext, useEffect, useState } from 'react';

import { ChatBotMessage } from '@graasp/sdk';

import { API_ROUTES } from '../api/routes';
import { TokenContext, useLocalContext } from '../components';
import { UserDataType } from '../types';

const { buildPostChatBotRoute } = API_ROUTES;

type CallbackType = (completion: string, data: UserDataType) => void;
type ReturnType = {
  isLoading: boolean;
  callApi: (prompt: Array<ChatBotMessage>, userData: UserDataType) => void;
};
export const useChatbotApi = (callback: CallbackType): ReturnType => {
  const [isLoading, setIsLoading] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false);
  const [prompt, setPrompt] = useState<Array<ChatBotMessage>>();
  const [data, setData] = useState<UserDataType>({});
  const token = useContext(TokenContext);
  const context = useLocalContext();
  const { apiHost, itemId } = context;
  const apiUrl = `${apiHost}/${buildPostChatBotRoute(itemId)}`;

  useEffect(
    () => {
      async function fetchApi(): Promise<void> {
        setIsLoading(true);

        fetch(apiUrl, {
          method: 'POST',
          body: JSON.stringify(prompt),
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
            // because the chatBot is behind the api, the auth token is required
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => {
            if (response.ok) {
              return response.json();
            }
            return { completion: 'Sorry, an error occurred' };
          })
          .then((json) => {
            const completion = json.completion.trim().replace(/^(Chatbot:)/gm, '');
            callback(completion, data);
            setIsLoading(false);
            setShouldFetch(false);
          });
      }
      if (prompt && shouldFetch) {
        fetchApi();
      }
    },
    // eslint-disable-next-line
    [shouldFetch],
  );

  const callApi = (
    chatbotPrompt: Array<ChatBotMessage>,
    userData: { [key: string]: unknown },
  ): void => {
    setPrompt(chatbotPrompt);
    setData(userData);
    setShouldFetch(true);
  };

  return {
    isLoading,
    callApi,
  };
};
