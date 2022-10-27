import React, { createContext, FC, useContext } from 'react';
import qs from 'qs';
import { LocalContext, LocalContextRecord } from '../types';
import { UseQueryResult } from 'react-query';
import { buildMockLocalContext } from '../mockServer/fixtures';
import { RecordOf } from 'immutable';

const Context = createContext<RecordOf<LocalContext>>(LocalContextRecord());

interface Props {
  useGetLocalContext: (itemId: string) => UseQueryResult<RecordOf<LocalContext>, unknown>;
  LoadingComponent?: React.ReactElement;
  defaultValue?: RecordOf<LocalContext>;
  onError?: (error: unknown) => void;
}

const withContext =
  <P extends object>(Component: React.ComponentType<P>, props: Props): FC<P> =>
  (childProps: P) => {
    const { LoadingComponent, defaultValue, useGetLocalContext, onError } = props;
    const { itemId } = qs.parse(window.location.search, {
      ignoreQueryPrefix: true,
    });
    const { data: context, isLoading, isError, error } = useGetLocalContext(itemId as string);

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

    // todo: define a context to default to
    const value = context ?? defaultValue ?? LocalContextRecord(buildMockLocalContext());

    return (
      <Context.Provider value={value}>
        <Component {...(childProps as P)} />
      </Context.Provider>
    );
  };

const useLocalContext = () => useContext(Context);

export {
  useLocalContext,
  /**
   * @deprecated Using `React.useContext(Context)` is deprecated.
   * Please use exported `useLocalContext()` hook instead
   */
  Context,
  withContext,
};
