import React, { createContext, FC } from 'react';
import qs from 'qs';
import { LocalContext } from '../types';
import { UseQueryResult } from 'react-query';
import { buildMockLocalContext } from '../mockServer/fixtures';
import { RecordOf } from 'immutable';

const Context = createContext({});

interface Props {
  useGetLocalContext: (args: unknown) => UseQueryResult<RecordOf<LocalContext>, unknown>;
  LoadingComponent?: React.ReactElement;
  defaultValue?: LocalContext;
  onError?: (error: unknown) => void;
}

const withContext =
  <P extends object>(Component: React.ComponentType<P>, props: Props): FC<P> =>
  (childProps: P) => {
    const { LoadingComponent, defaultValue, useGetLocalContext, onError } = props;
    const { itemId } = qs.parse(window.location.search, {
      ignoreQueryPrefix: true,
    });
    const { data: context, isLoading, isError, error } = useGetLocalContext(itemId);

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

    // todo: define a context to default to
    const value = context ?? defaultValue ?? buildMockLocalContext();

    return (
      <Context.Provider value={value}>
        <Component {...(childProps as P)} />
      </Context.Provider>
    );
  };

export { Context, withContext };
