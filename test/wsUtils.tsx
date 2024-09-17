import { ReactNode } from 'react';

import { QueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import configureQueryClient from '../src/queryClient.js';
import { Notifier, QueryClientConfig } from '../src/types.js';
import { Channel } from '../src/ws/ws-client.js';
import { API_HOST, GRAASP_APP_KEY, WS_HOST } from './constants.js';

export type Handler = { channel: Channel; handler: (event: unknown) => void };

const MockedWebsocket = (handlers: Handler[]) => ({
  subscribe: vi.fn((channel, handler) => {
    handlers.push({ channel, handler });
  }),
  unsubscribe: vi.fn(),
});

export const setUpWsTest = (args?: {
  enableWebsocket?: boolean;
  notifier?: Notifier;
  // eslint-disable-next-line @typescript-eslint/ban-types
  configureWsAppActionsHooks: Function;
  // eslint-disable-next-line @typescript-eslint/ban-types
  configureWsAppDataHooks: Function;
  // eslint-disable-next-line @typescript-eslint/ban-types
  configureWsAppSettingHooks: Function;
}) => {
  const {
    notifier = () => {
      // do nothing
    },
    configureWsAppActionsHooks = () => {
      // do nothing
      console.warn('No websocket hook provided.');
    },
    configureWsAppDataHooks = () => {
      // do nothing
      console.warn('No websocket hook provided.');
    },
    configureWsAppSettingHooks = () => {
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
    enableWebsocket: false,
    WS_HOST,
    GRAASP_APP_KEY,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    isStandalone: false,
  };

  const { QueryClientProvider, useMutation } = configureQueryClient(queryConfig);

  const handlers: Handler[] = [];
  const websocketClient = MockedWebsocket(handlers);

  // configure hooks
  const hooks = {
    ...configureWsAppActionsHooks(websocketClient),
    ...configureWsAppDataHooks(websocketClient),
    ...configureWsAppSettingHooks(websocketClient),
  };

  const queryClient = new QueryClient();

  const wrapper = ({ children }: { children: ReactNode }): JSX.Element => (
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

  if (result.error) console.error(result.error);

  // this hook is disabled, it will never fetch
  if (enabled === false) {
    return result.current;
  }

  // return hook data
  return result.current;
};

export const getHandlerByChannel = (handlers: Handler[], channel: Channel): Handler | undefined =>
  handlers.find(
    ({ channel: thisChannel }) =>
      channel.name === thisChannel.name && channel.topic === thisChannel.topic,
  );
