import React, { ReactElement, createContext, useContext } from 'react';

import { Refresh } from '@mui/icons-material';
import { Button, Stack, Typography } from '@mui/material';

import { Context, LocalContext, PermissionLevel } from '@graasp/sdk';

import { UseQueryResult } from '@tanstack/react-query';

import { AutoResizer } from './AutoResizer';

export const defaultContextValue: LocalContext = {
  apiHost: '',
  itemId: '',
  accountId: '',
  settings: {},
  mobile: false,
  dev: false,
  offline: false,
  lang: 'en',
  context: Context.Builder,
  standalone: false,
  permission: PermissionLevel.Read,
};

const LocalContextContext = createContext<LocalContext>(defaultContextValue);

interface WithLocalContextProps {
  children: ReactElement;
  useGetLocalContext: (
    itemId: string,
    defaultValue: LocalContext,
  ) => UseQueryResult<LocalContext, unknown>;
  LoadingComponent?: React.ReactElement;
  defaultValue: LocalContext;
  onError?: (error: unknown) => void;
  useAutoResize?: (itemId: string) => void;
}

const WithLocalContext = ({
  LoadingComponent,
  defaultValue,
  useGetLocalContext,
  onError,
  useAutoResize,
  children,
}: WithLocalContextProps): JSX.Element => {
  const itemId = new URL(window.location.toString()).searchParams.get('itemId') || '';
  const { data: context, isLoading, isError, error } = useGetLocalContext(itemId, defaultValue);
  if (context) {
    return (
      <LocalContextContext.Provider value={context}>
        {useAutoResize ? (
          <AutoResizer itemId={itemId} useAutoResize={useAutoResize}>
            {children}
          </AutoResizer>
        ) : (
          children
        )}
      </LocalContextContext.Provider>
    );
  }

  if (isLoading) {
    return LoadingComponent ?? <div>Loading LocalContext...</div>;
  }

  if (isError) {
    if (onError) {
      onError(error);
    } else {
      console.error(error);
    }
  }
  return (
    <Stack direction="column" alignItems="center" spacing={2}>
      <Typography maxWidth="50ch">
        Could not get `LocalContext`. Check if you have mocking enabled, or if you are running in an
        iframe, that the parent window replies to your messages.
      </Typography>
      <Button onClick={() => window.location.reload()} startIcon={<Refresh />}>
        Refresh
      </Button>
    </Stack>
  );
};

// **********************************************************************
//
// Do NOT use/change/update what is bellow here, it will be removed soon.
//
// **********************************************************************

/**
 * @deprecated
 */
interface Props {
  useGetLocalContext: (
    itemId: string,
    defaultValue: LocalContext,
  ) => UseQueryResult<LocalContext, unknown>;
  LoadingComponent?: React.ReactElement;
  defaultValue: LocalContext;
  onError?: (error: unknown) => void;
  useAutoResize?: (itemId: string) => void;
}

/**
 * @deprecated use `WithLocalContext` instead
 */
const withContext = <P extends object>(
  Component: React.ComponentType<P>,
  props: Props,
): ((childProps: P) => JSX.Element) => {
  const WithContextComponent = (childProps: P): JSX.Element => {
    const { LoadingComponent, defaultValue, useGetLocalContext, onError, useAutoResize } = props;

    const itemId = new URL(window.location.toString()).searchParams.get('itemId') || '';
    const { data: context, isLoading, isError, error } = useGetLocalContext(itemId, defaultValue);
    if (context) {
      const children = <Component {...childProps} />;

      return (
        <LocalContextContext.Provider value={context}>
          {useAutoResize ? (
            <AutoResizer itemId={itemId} useAutoResize={useAutoResize}>
              {children}
            </AutoResizer>
          ) : (
            children
          )}
        </LocalContextContext.Provider>
      );
    }

    if (isLoading) {
      return LoadingComponent ?? <div>Loading LocalContext...</div>;
    }

    if (isError) {
      if (onError) {
        onError(error);
      } else {
        console.error(error);
      }
    }
    return (
      <div>
        Could not get `LocalContext`. Check if you have mocking enabled, or if you are running in an
        iframe, that the parent window replies to your messages
      </div>
    );
  };
  return WithContextComponent;
};

const useLocalContext = (): LocalContext => useContext(LocalContextContext);

export { useLocalContext, WithLocalContext, withContext };
