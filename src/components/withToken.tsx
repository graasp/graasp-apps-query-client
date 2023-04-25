import React, { createContext, FC } from 'react';
import qs from 'qs';
import { UseQueryResult } from '@tanstack/react-query';
import { Token } from '../types';

// mock token, necessary for first renders
const defaultToken = 'mock-token';

const TokenContext = createContext<string>(defaultToken);

interface Props {
  useAuthToken: (itemId: string) => UseQueryResult<Token, unknown>;
  LoadingComponent?: React.ReactElement;
  onError?: (error: unknown) => void;
}

const withToken =
  <P extends object>(Component: React.ComponentType<P>, props: Props): FC<P> =>
  (childProps: P) => {
    const { LoadingComponent, onError, useAuthToken } = props;
    const { itemId } = qs.parse(window.location.search, {
      ignoreQueryPrefix: true,
    });
    if (!itemId) {
      const error = 'ItemId not found in querystring parameters';
      if (onError) {
        onError(error);
      } else {
        console.error(error);
      }
    }

    const { data, isLoading, isError, error } = useAuthToken(itemId as string);

    if (isLoading) {
      return LoadingComponent ?? <div>loading...</div>;
    }

    if (isError) {
      if (onError) {
        onError(error);
      } else {
        console.error(error);
      }
    }

    const value = data ?? defaultToken;
    return (
      <TokenContext.Provider value={value}>
        <Component {...(childProps as P)} />
      </TokenContext.Provider>
    );
  };

export { TokenContext, withToken };
