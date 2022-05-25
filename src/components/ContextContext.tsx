import React, { createContext, FC } from 'react';
import qs from 'qs';
import { LocalContext } from '../types';
import { UseQueryResult } from 'react-query';

const Context = createContext({});

interface Props {
  children: React.ReactElement;
  LoadingComponent: React.ReactElement;
  defaultValue: LocalContext;
  useGetLocalContext: (args: unknown) => UseQueryResult<LocalContext, unknown>;
  onError: (error: unknown) => void;
}

const ContextProvider: FC<Props> = ({
  children,
  defaultValue,
  LoadingComponent,
  useGetLocalContext,
  onError,
}) => {
  const { itemId } = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  });
  const { data: context, isLoading, isError, error } = useGetLocalContext(itemId);

  // here is a good place to change the app language

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

  // todo: define a context to default to
  const value = context ?? defaultValue;

  return <Context.Provider value={value}> {children} </Context.Provider>;
};

export { Context, ContextProvider };
