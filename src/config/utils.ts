import { LocalContext } from '@graasp/sdk';

import { QueryClient } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';

import { QueryClientConfig } from '../types.js';
import {
  MissingAppKeyError,
  MissingAppOriginError,
  MissingNecessaryDataError,
  MissingPermissionError,
} from './errors.js';
import { AUTH_TOKEN_KEY, LOCAL_CONTEXT_KEY } from './keys.js';

export class MissingApiHostError extends Error {
  statusCode: number;

  constructor() {
    super(
      'Api Host is not defined. Do You have it in your .env ? Did you set up the context with useContext?',
    );
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

export const getApiHost = (queryClient: QueryClient) => {
  const context = queryClient.getQueryData<LocalContext>(LOCAL_CONTEXT_KEY);
  const apiHost = context?.apiHost;
  if (!apiHost) {
    throw new MissingApiHostError();
  }
  return apiHost;
};

export const getPermissionLevel = (queryClient: QueryClient) => {
  const context = queryClient.getQueryData<LocalContext>(LOCAL_CONTEXT_KEY);
  const permission = context?.permission;
  if (!permission) {
    throw new MissingPermissionError();
  }
  return permission;
};

export const getData = (
  queryClient: QueryClient,
  options: { shouldMemberExist?: boolean } = {},
): { itemId: string; accountId?: string; token: string } => {
  const data = queryClient.getQueryData<LocalContext>(LOCAL_CONTEXT_KEY);
  if (!data) {
    throw new Error('`LocalContext` was undefined');
  }
  const token = queryClient.getQueryData<string>(AUTH_TOKEN_KEY);
  if (!token) {
    throw new MissingNecessaryDataError({ token });
  }
  const { itemId, accountId } = data;

  if (options.shouldMemberExist ?? true) {
    if (!accountId) {
      console.debug('account id is not defined');
    }
  }
  if (!itemId) {
    console.error('item id is not defined');
  }
  if (!token) {
    console.error('token is not defined');
  }

  return { itemId, accountId, token };
};

export const getDataOrThrow = (
  queryClient: QueryClient,
  options: { shouldMemberExist?: boolean } = {},
): { itemId: string; accountId?: string; token: string } => {
  const { itemId, token, accountId } = getData(queryClient);
  if (!itemId || !token) {
    throw new MissingNecessaryDataError({ itemId, token });
  }
  if (options.shouldMemberExist ?? true) {
    if (!accountId) {
      throw new MissingNecessaryDataError({ itemId, token, accountId });
    }
  }
  return { itemId, token, accountId };
};

export const buildAppKeyAndOriginPayload = (
  queryConfig: QueryClientConfig,
): { key: string; origin: string } => {
  const key = queryConfig.GRAASP_APP_KEY;
  const origin = window?.location?.origin;

  if (!key) {
    throw new MissingAppKeyError();
  }
  if (!origin) {
    throw new MissingAppOriginError();
  }

  return { key, origin };
};
