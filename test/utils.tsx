import { ReactNode } from 'react';

import { HttpMethod } from '@graasp/sdk';

import { QueryObserverBaseResult, UseMutationResult } from '@tanstack/react-query';
import { RenderHookOptions, renderHook, waitFor } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import nock, { InterceptFunction, ReplyHeaders, Scope } from 'nock';
import { v4 } from 'uuid';
import { expect, vi } from 'vitest';

import configureHooks from '../src/hooks/index.js';
import configureQueryClient from '../src/queryClient.js';
import { Notifier, QueryClientConfig } from '../src/types.js';
import { API_HOST, MOCK_APP_ORIGIN, RequestMethods, WS_HOST } from './constants.js';

type Args = { enableWebsocket?: boolean; notifier?: Notifier; GRAASP_APP_KEY?: string };

export const setUpTest = (args?: Args) => {
  const {
    notifier = () => {
      // do nothing
    },
    GRAASP_APP_KEY = v4(),
  } = args ?? {};
  const queryConfig: QueryClientConfig = {
    API_HOST,
    retry: () => false,
    cacheTime: 0,
    staleTime: 0,
    SHOW_NOTIFICATIONS: false,
    notifier,
    GRAASP_APP_KEY,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    WS_HOST,
    enableWebsocket: false,
    isStandalone: false,
  };

  const { queryClient, QueryClientProvider, mutations, useMutation } =
    configureQueryClient(queryConfig);

  // configure hooks
  const hooks = configureHooks(queryConfig);

  const wrapper = ({ children }: { children: ReactNode }): JSX.Element => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { hooks, wrapper, queryClient, mutations, useMutation };
};

export type Endpoint = {
  route: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any;
  method?: `${RequestMethods}`;
  statusCode?: number;
  headers?: ReplyHeaders;
};

interface MockArguments<TProps> {
  endpoints?: Endpoint[];
  wrapper: RenderHookOptions<TProps>['wrapper'];
}
interface MockHookArguments<TProps, TResult extends QueryObserverBaseResult>
  extends MockArguments<TProps> {
  hook: (props: TProps) => TResult;
  enabled?: boolean;
}
interface MockMutationArguments<TProps, TData, TError, TVariables, TContext>
  extends MockArguments<TProps> {
  mutation: () => UseMutationResult<TData, TError, TVariables, TContext>;
}

type NockMethodType = Exclude<
  {
    [MethodName in keyof Scope]: Scope[MethodName] extends InterceptFunction ? MethodName : never;
  }[keyof Scope],
  undefined | 'intercept'
>;

export const mockEndpoints = (endpoints: Endpoint[]): nock.Scope => {
  // mock endpoint with given response
  // we open to all hosts specially for redirection to aws (get file endpoints)
  const server = nock(/.*/);
  endpoints.forEach(({ route, method, statusCode, response, headers }) => {
    server[(method ?? HttpMethod.Get).toLowerCase() as NockMethodType](route).reply(
      statusCode || StatusCodes.OK,
      response,
      {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        ...headers,
      },
    );
  });
  return server;
};

export const mockHook = async <TProps, TResult extends QueryObserverBaseResult>({
  endpoints,
  hook,
  wrapper,
  enabled,
}: MockHookArguments<TProps, TResult>): Promise<TResult> => {
  if (endpoints) {
    mockEndpoints(endpoints);
  }

  // wait for rendering hook
  const { result } = renderHook(hook, { wrapper });

  // this hook is disabled, it will never fetch
  if (enabled === false) {
    return result.current;
  }
  await waitFor(() => {
    expect(result.current.isSuccess || result.current.isError).toBe(true);
  });

  // return hook data
  return result.current;
};

export const mockMutation = async <TData, TError, TVariables, TContext, TProps>({
  mutation,
  wrapper,
  endpoints,
}: MockMutationArguments<TProps, TData, TError, TVariables, TContext>): Promise<
  UseMutationResult<TData, TError, TVariables, TContext>
> => {
  if (endpoints) {
    mockEndpoints(endpoints);
  }

  // wait for rendering hook
  const { result } = renderHook(mutation, { wrapper });
  await waitFor(() => expect(result.current.isIdle).toBe(true));

  // return mutation data
  return result.current;
};

// util function to wait some time after a mutation is performed
// this is necessary for success and error callback to fully execute
export const waitForMutation = async (t = 500): Promise<void> => {
  await new Promise((r) => {
    setTimeout(r, t);
  });
};

export const mockWindowForPostMessage = (
  event: MessageEvent,
  origin: string | null = MOCK_APP_ORIGIN,
) => {
  globalThis.window = {
    location: { origin },
    parent: {
      postMessage: vi.fn(),
    },
    removeEventListener: vi.fn(),
    // eslint-disable-next-line @typescript-eslint/ban-types, arrow-body-style
    addEventListener: (_event: string, f: Function) => {
      // check event listener works as expected given mock input
      return f(event);
    },
  } as unknown as Window & typeof globalThis;
};
