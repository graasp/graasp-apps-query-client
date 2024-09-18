import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
  dehydrate,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';

import { API_ROUTES } from './api/routes.js';
import { CACHE_TIME_MILLISECONDS, STALE_TIME_MILLISECONDS } from './config/constants.js';
import { QUERY_KEYS, buildPostMessageKeys } from './config/keys.js';
import configureHooks from './hooks/index.js';
import configureMutations from './mutations/index.js';
import {
  OptionalQueryClientConfig,
  QueryClientConfig,
  RequiredQueryClientConfig,
} from './types.js';
import { getWebsocketClient } from './ws/index.js';

const makeWsHostFromAPIHost = (apiHost?: string): string | undefined => {
  if (apiHost) {
    const url = new URL('/ws', apiHost);
    url.protocol = 'ws:';
    return url.toString();
  }
  return undefined;
};

// Query client retry function decides when and how many times a request should be retried
const defaultRetryFunction = (failureCount: number, error: unknown): boolean => {
  // retry if the request timed out
  const codes = [StatusCodes.GATEWAY_TIMEOUT, StatusCodes.REQUEST_TIMEOUT];
  const reasons = codes.map((code) => getReasonPhrase(code));

  if (error instanceof Error && (reasons.includes(error.message) || reasons.includes(error.name))) {
    return failureCount < 3;
  }

  return false;
};

const configure = (
  config: RequiredQueryClientConfig & Partial<OptionalQueryClientConfig>,
): {
  API_ROUTES: typeof API_ROUTES;
  buildPostMessageKeys: typeof buildPostMessageKeys;
  dehydrate: typeof dehydrate;
  Hydrate: typeof Hydrate;
  hooks: ReturnType<typeof configureHooks>;
  mutations: ReturnType<typeof configureMutations>;
  QUERY_KEYS: typeof QUERY_KEYS;
  queryClient: QueryClient;
  QueryClientProvider: typeof QueryClientProvider;
  ReactQueryDevtools: typeof ReactQueryDevtools;
  useMutation: typeof useMutation;
  useQuery: typeof useQuery;
} => {
  // define config for query client
  const queryConfig: QueryClientConfig = {
    API_HOST: config.API_HOST,
    SHOW_NOTIFICATIONS: config.SHOW_NOTIFICATIONS ?? false,
    GRAASP_APP_KEY: config.GRAASP_APP_KEY ?? config.GRAASP_APP_ID,
    keepPreviousData: config.keepPreviousData || true,
    retry: config.retry ?? defaultRetryFunction,
    notifier: config.notifier ?? console.info,
    // time until data in cache considered stale if cache not invalidated
    staleTime: config.staleTime || STALE_TIME_MILLISECONDS,
    // time before cache labeled as inactive to be garbage collected
    cacheTime: config.cacheTime || CACHE_TIME_MILLISECONDS,
    // derive WS_HOST from API_HOST if needed
    // TODO: pass it with the context
    WS_HOST: config.WS_HOST || makeWsHostFromAPIHost(config.API_HOST),
    // whether websocket support should be enabled
    enableWebsocket: Boolean(config.enableWebsocket),
    refetchOnWindowFocus: config.refetchOnWindowFocus ?? false,
    isStandalone: config.isStandalone ?? false,
  };

  // create queryclient with given config
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: queryConfig.refetchOnWindowFocus,
        retry: queryConfig.retry,
      },
    },
  });

  // set up mutations given config
  // mutations are attached to queryClient
  const mutations = configureMutations(queryConfig);

  // set up websocket client
  const websocketClient = getWebsocketClient(queryConfig);

  // set up hooks given config
  const hooks = configureHooks(queryConfig, websocketClient);

  // returns the queryClient and relative instances
  return {
    API_ROUTES,
    buildPostMessageKeys,
    dehydrate,
    hooks,
    Hydrate,
    mutations,
    QUERY_KEYS,
    queryClient,
    QueryClientProvider,
    ReactQueryDevtools,
    useMutation,
    useQuery,
  };
};
export default configure;
