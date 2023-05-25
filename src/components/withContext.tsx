import qs from 'qs';
import React, { createContext, FC, useContext } from 'react';
import { UseQueryResult } from '@tanstack/react-query';
import { buildMockLocalContext } from '../mockServer/fixtures';
import { LocalContext, LocalContextRecord } from '../types';
import { AutoResizer } from './AutoResizer';
import { Context as ContextType, convertJs, PermissionLevel } from '@graasp/sdk';

const defaultValue: LocalContext = {
  apiHost: '',
  itemId: '',
  memberId: undefined,
  settings: {},
  dev: false,
  offline: false,
  lang: 'en',
  context: ContextType.Builder,
  standalone: false,
  permission: PermissionLevel.Read,
};

const Context = createContext<LocalContextRecord>(convertJs(defaultValue));

interface Props {
  useGetLocalContext: (itemId: string) => UseQueryResult<LocalContextRecord, unknown>;
  LoadingComponent?: React.ReactElement;
  defaultValue?: LocalContextRecord;
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
    const value = context ?? defaultValue ?? convertJs(buildMockLocalContext({ itemId }));

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
