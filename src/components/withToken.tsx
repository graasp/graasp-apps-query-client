import React, { createContext, FC } from 'react';
import qs from 'qs';
import { UseQueryResult } from 'react-query';
import { Token } from '../types';

// mock token, necessary for first renders
const defaultToken = 'mock-token';

const TokenContext = createContext<string>(defaultToken);

interface Props {
  useAuthToken: (args: unknown) => UseQueryResult<Token, unknown>;
  LoadingComponent?: React.ReactElement;
  onError?: (error: unknown) => void;
}

const withToken =
  <P extends object>(Component: React.ComponentType<P>, props: Props): FC<Props> =>
  () => {
    const { LoadingComponent, onError, useAuthToken } = props;
    const { itemId } = qs.parse(window.location.search, {
      ignoreQueryPrefix: true,
    });
    const { data, isLoading, isError, error } = useAuthToken(itemId);

    if (isLoading) {
      return LoadingComponent ?? <div>loading...</div>;
    }

    if (isError) {
      if (onError) {
        onError?.(error);
      } else {
        console.error(error);
      }
    }

    const value = data ?? defaultToken;
    return (
      <TokenContext.Provider value={value}>
        <Component {...(props as P)} />
      </TokenContext.Provider>
    );
  };

export { TokenContext, withToken };
