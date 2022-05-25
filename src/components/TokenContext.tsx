import React, { createContext, FC } from 'react';
import qs from 'qs';
import { UseQueryResult } from 'react-query';
import { Token } from '../types';

// mock token, necessary for first renders
const defaultToken = 'mock-token';

const TokenContext = createContext<string>(defaultToken);

interface Props {
  children: React.ReactElement;
  LoadingComponent: React.ReactElement;
  useAuthToken: (args: unknown) => UseQueryResult<Token, unknown>;
  onError: (error: unknown) => void;
}

const TokenProvider: FC<Props> = ({ children, LoadingComponent, onError, useAuthToken }) => {
  const { itemId } = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  });
  const { data, isLoading, isError, error } = useAuthToken(itemId);

  if (isLoading) {
    return LoadingComponent ?? 'loading...';
  }

  if (isError) {
    if (onError) {
      onError?.(error);
    } else {
      console.error(error);
    }
  }

  const value = data ?? defaultToken;
  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>;
};

export { TokenContext, TokenProvider };
