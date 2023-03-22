import React from 'react';
import { v4 } from 'uuid';
import { renderHook, RenderResult, WaitFor } from '@testing-library/react-hooks';
import nock, { ReplyHeaders } from 'nock';
import { StatusCodes } from 'http-status-codes';
import { QueryObserverBaseResult, MutationObserverResult } from '@tanstack/react-query';
import configureHooks from '../src/hooks';
import { Notifier, QueryClientConfig } from '../src/types';
import { API_HOST, MOCK_APP_ORIGIN, REQUEST_METHODS } from './constants';
import configureQueryClient from '../src/queryClient';

type Args = { enableWebsocket?: boolean; notifier?: Notifier; GRAASP_APP_ID?: string | null };
type NockRequestMethods = Lowercase<`${REQUEST_METHODS}`>;

export const setUpTest = (args?: Args) => {
  const {
    notifier = () => {
      // do nothing
    },
    GRAASP_APP_ID = v4(),
  } = args ?? {};
  const queryConfig: QueryClientConfig = {
    API_HOST,
    retry: () => {
      return false;
    },
    shouldRetry: false,
    cacheTime: 0,
    staleTime: 0,
    SHOW_NOTIFICATIONS: false,
    notifier,
    GRAASP_APP_ID,
  };

  const { queryClient, QueryClientProvider, useMutation } = configureQueryClient(queryConfig);

  // configure hooks
  const hooks = configureHooks(queryClient, queryConfig);

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { hooks, wrapper, queryClient, useMutation };
};

export type Endpoint = {
  route: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any;
  method?: `${REQUEST_METHODS}`;
  statusCode?: number;
  headers?: ReplyHeaders;
};

interface MockArguments {
  endpoints?: Endpoint[];
  wrapper: (args: { children: React.ReactNode }) => JSX.Element;
}

interface MockHookArguments extends MockArguments {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hook: () => any;
  enabled?: boolean;
}
interface MockMutationArguments extends MockArguments {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mutation: () => any;
}

export const mockEndpoints = (endpoints: Endpoint[]) => {
  // mock endpoint with given response
  // we open to all hosts specially for redirection to aws (get file endpoints)
  const server = nock(/.*/);
  endpoints.forEach(({ route, method, statusCode, response, headers }) => {
    server[(method || REQUEST_METHODS.GET).toLowerCase() as NockRequestMethods](route).reply(
      statusCode || StatusCodes.OK,
      response,
      headers,
    );
  });
  return server;
};

export const mockHook = async ({ endpoints, hook, wrapper, enabled }: MockHookArguments) => {
  endpoints && mockEndpoints(endpoints);

  // wait for rendering hook
  const {
    result,
    waitFor,
  }: {
    result: RenderResult<QueryObserverBaseResult>;
    waitFor: WaitFor;
  } = renderHook(hook, { wrapper });

  // this hook is disabled, it will never fetch
  if (enabled === false) {
    return result.current;
  }
  await waitFor(() => {
    return result.current.isSuccess || result.current.isError;
  });

  // return hook data
  return result.current;
};

export const mockMutation = async ({ mutation, wrapper, endpoints }: MockMutationArguments) => {
  endpoints && mockEndpoints(endpoints);

  // wait for rendering hook
  const {
    result,
    waitFor,
  }: {
    // data, error and variables types are always different
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result: RenderResult<MutationObserverResult<any, any, any>>;
    waitFor: WaitFor;
  } = renderHook(mutation, { wrapper });
  await waitFor(() => result.current.isIdle);

  // return mutation data
  return result.current;
};

// util function to wait some time after a mutation is performed
// this is necessary for success and error callback to fully execute
export const waitForMutation = async (t = 500) => {
  await new Promise((r) => {
    setTimeout(r, t);
  });
};

export const mockWindowForPostMessage = (
  event: MessageEvent,
  origin: string | null = MOCK_APP_ORIGIN,
) => {
  global.window = {
    location: { origin },
    parent: {
      postMessage: jest.fn(),
    },
    removeEventListener: jest.fn(),
    // eslint-disable-next-line @typescript-eslint/ban-types
    addEventListener: (_event: string, f: Function) => {
      // check event listener works as expected given mock input
      return f(event);
    },
  } as unknown as Window & typeof globalThis;
};
