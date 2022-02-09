import { QueryClient } from 'react-query';
import { Record } from 'immutable';
import { LocalContext, QueryClientConfig } from '../types';
import { AUTH_TOKEN_KEY, LOCAL_CONTEXT_KEY } from './keys';
import { StatusCodes } from 'http-status-codes';
import { MissingAppIdError, MissingAppOriginError } from './errors';
export class MissingApiHostError extends Error {
  statusCode: number;
  constructor() {
    super('Api Host is not defined. Did you set up the context with useContext?');
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

export const getApiHost = (queryClient: QueryClient) => {
  const context = queryClient.getQueryData<Record<LocalContext>>(LOCAL_CONTEXT_KEY);
  const apiHost = context?.get('apiHost');
  if (!apiHost) {
    throw new MissingApiHostError();
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

export const buildAppIdAndOriginPayload = (queryConfig: QueryClientConfig) => {
  const payload = {
    app: queryConfig.GRAASP_APP_ID,
    origin: window?.location?.origin,
  };

  if (!payload.app) {
    throw new MissingAppIdError();
  }
  if (!payload.origin) {
    throw new MissingAppOriginError();
  }

  return payload;
};
