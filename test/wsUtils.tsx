import { renderHook } from '@testing-library/react-hooks';
import React from 'react';
import { QueryClient } from '@tanstack/react-query';

import configureQueryClient from '../src/queryClient';
import { Notifier, QueryClientConfig } from '../src/types';
// import { isDataEqual } from '../src/utils/util';
import { Channel } from '../src/ws/ws-client';
import { API_HOST, WS_HOST } from './constants';

export type Handler = { channel: Channel; handler: (event: unknown) => void };

const MockedWebsocket = (handlers: Handler[]) => ({
  subscribe: jest.fn((channel, handler) => {
    // eslint-disable-next-line no-param-reassign
    handlers.push({ channel, handler });
  }),
  unsubscribe: jest.fn(),
});

export const setUpWsTest = (args?: {
  enableWebsocket?: boolean;
  notifier?: Notifier;
  // eslint-disable-next-line @typescript-eslint/ban-types
  configureWsHooks: Function;
}) => {
  const {
    notifier = () => {
      // do nothing
    },
    configureWsHooks = () => {
      // do nothing
      console.warn('No websocket hook provided.');
    },
  } = args ?? {};
  const queryConfig: QueryClientConfig = {
    API_HOST,
    retry: 0,
    cacheTime: 0,
    staleTime: 0,
    SHOW_NOTIFICATIONS: false,
    notifier,
    enableWebsocket: true,
    WS_HOST,
  };

  const { QueryClientProvider, useMutation } =
    configureQueryClient(queryConfig);

  const handlers: Handler[] = [];
  const websocketClient = MockedWebsocket(handlers);

  // configure hooks
  const hooks = configureWsHooks(websocketClient);

  const queryClient = new QueryClient();

  const wrapper = ({
    children,
  }: {
    children: React.ReactNode;
  }): JSX.Element => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { hooks, wrapper, queryClient, useMutation, handlers };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockWsHook = async ({ hook, wrapper, enabled }: any) => {
  // wait for rendering hook
  const {
    result,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result: any;
  } = renderHook(hook, { wrapper });

  if(result.error) console.error(result.error);

  // this hook is disabled, it will never fetch
  if (enabled === false) {
    return result.current;
  }

  // return hook data
  return result.current;
};

export const getHandlerByChannel = (
  handlers: Handler[],
  channel: Channel,
): Handler | undefined =>
  handlers.find(
    ({ channel: thisChannel }) =>
      channel.name === thisChannel.name && channel.topic === thisChannel.topic,
  );
