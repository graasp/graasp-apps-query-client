import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  Hydrate,
  dehydrate,
  useQuery,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { MUTATION_KEYS, QUERY_KEYS, buildPostMessageKeys } from './config/keys';
import { CACHE_TIME_MILLISECONDS, STALE_TIME_MILLISECONDS } from './config/constants';
import configureHooks from './hooks';
import configureMutations from './mutations';
import { API_ROUTES } from './api/routes';
import { QueryClientConfig } from './types';

// Query client retry function decides when and how many times a request should be retried
const defaultRetryFunction = (failureCount: number, error: Error) => {
  // do not retry if the request was not authorized
  // the user is probably not signed in
  const codes = [
    StatusCodes.UNAUTHORIZED,
    StatusCodes.NOT_FOUND,
    StatusCodes.BAD_REQUEST,
    StatusCodes.FORBIDDEN,
  ];
  const reasons = codes.map((code) => getReasonPhrase(code));

  if (reasons.includes(error.message) || reasons.includes(error.name)) {
    return false;
  }
  return failureCount < 3;
};

export default (config: Partial<QueryClientConfig>) => {
  const baseConfig = {
    SHOW_NOTIFICATIONS:
      config?.SHOW_NOTIFICATIONS || process.env.REACT_APP_SHOW_NOTIFICATIONS === 'true' || false,
    keepPreviousData: config?.keepPreviousData || false,
    retry: config?.retry ?? defaultRetryFunction,
  };

  // define config for query client
  const queryConfig: QueryClientConfig = {
    ...baseConfig,
    targetWindow: config?.targetWindow,
    GRAASP_APP_KEY: config.GRAASP_APP_KEY ?? config.GRAASP_APP_ID,
    notifier: config?.notifier,
    // time until data in cache considered stale if cache not invalidated
    staleTime: config?.staleTime || STALE_TIME_MILLISECONDS,
    // time before cache labeled as inactive to be garbage collected
    cacheTime: config?.cacheTime || CACHE_TIME_MILLISECONDS,
  };

  // create queryclient with given config
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: config?.refetchOnWindowFocus || false,
        retry: config?.shouldRetry ?? true,
      },
    },
  });

  // set up mutations given config
  // mutations are attached to queryClient
  configureMutations(queryClient, queryConfig);

  // set up hooks given config
  const hooks = configureHooks(queryClient, queryConfig);

  // returns the queryClient and relative instances
  return {
    queryClient,
    QueryClientProvider,
    hooks,
    useMutation,
    ReactQueryDevtools,
    dehydrate,
    Hydrate,
    useQuery,
    MUTATION_KEYS,
    QUERY_KEYS,
    buildPostMessageKeys,
    API_ROUTES,
  };
};
