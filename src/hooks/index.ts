import { QueryClient } from 'react-query';
import { QueryClientConfig } from '../types';
import configureAppsHooks from './apps';
import configurePostMessageHooks from './postMessage';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  return {
    ...configureAppsHooks(queryClient, queryConfig),
    ...configurePostMessageHooks(queryClient, queryConfig),
  };
};
