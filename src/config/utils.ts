import { QueryClient } from 'react-query';
import { Record } from 'immutable';
import { LocalContext } from '../types';
import { AUTH_TOKEN_KEY, LOCAL_CONTEXT_KEY } from './keys';

export const getApiHost = (queryClient: QueryClient) => {
  const context = queryClient.getQueryData<Record<LocalContext>>(LOCAL_CONTEXT_KEY);
  const apiHost = context?.get('apiHost');
  if (!apiHost) {
    throw new Error('api host is not defined!');
  }
  return apiHost;
};

export const getData = (queryClient: QueryClient) => {
  const data = queryClient.getQueryData<Record<LocalContext>>(LOCAL_CONTEXT_KEY);
  const token = queryClient.getQueryData<string>(AUTH_TOKEN_KEY);
  const itemId = data?.get('itemId');
  const memberId = data?.get('memberId');
  if (!data || !itemId || !memberId || !token) {
    throw new Error(
      `itemId ${itemId}, memberId ${memberId}, token are necessary data, but some are missing!`,
    );
  }
  return { itemId, memberId, token };
};
