import React, { createContext } from 'react';
import qs from 'qs';
import { LocalContext } from '../types';
import { UseQueryResult } from 'react-query';
import { buildMockLocalContext } from '../mockServer/fixtures';

const Context = createContext({});

interface Props {
  LoadingComponent?: React.ReactElement;
  defaultValue?: LocalContext;
  useGetLocalContext: (args: unknown) => UseQueryResult<LocalContext, unknown>;
  onError?: (error: unknown) => void;
}

const withContext = <P extends object>(Component: React.ComponentType<P>, props: Props) =>
  class WithContext extends React.Component<P & Props> {
    render() {
      const { LoadingComponent, defaultValue, useGetLocalContext, onError } = props;
      const { itemId } = qs.parse(window.location.search, {
        ignoreQueryPrefix: true,
      });
      const { data: context, isLoading, isError, error } = useGetLocalContext(itemId);

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
      const value = context ?? defaultValue ?? buildMockLocalContext();

      return (
        <Context.Provider value={value}>
          <Component {...(this.props as P)} />
        </Context.Provider>
      );
    }
  };

export { Context, withContext };
