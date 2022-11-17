import { RecordOf } from 'immutable';
import qs from 'qs';
import React, { createContext, FC, useContext } from 'react';
import { UseQueryResult } from 'react-query';
import { buildMockLocalContext } from '../mockServer/fixtures';
import { LocalContext, LocalContextRecord } from '../types';
import { AutoResizer } from './AutoResizer';

const Context = createContext<RecordOf<LocalContext>>(LocalContextRecord());

interface Props {
  useGetLocalContext: (itemId: string) => UseQueryResult<RecordOf<LocalContext>, unknown>;
  LoadingComponent?: React.ReactElement;
  defaultValue?: RecordOf<LocalContext>;
  onError?: (error: unknown) => void;
  useAutoResize?: (itemId: string) => void;
}

const withContext =
  <P extends object>(Component: React.ComponentType<P>, props: Props): FC<P> =>
  (childProps: P) => {
    const { LoadingComponent, defaultValue, useGetLocalContext, onError, useAutoResize } = props;
    const { itemId } = qs.parse(window.location.search, {
      ignoreQueryPrefix: true,
    }) as { itemId: string };
    const { data: context, isLoading, isError, error } = useGetLocalContext(itemId);

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

    const children = <Component {...(childProps as P)} />;

    return (
      <Context.Provider value={value}>
        {useAutoResize ? (
          <AutoResizer useAutoResize={() => useAutoResize(itemId)}>{children}</AutoResizer>
        ) : (
          children
        )}
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
