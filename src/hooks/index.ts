import { QueryClient } from 'react-query';
import { QueryClientConfig } from '../types';
import configureAppsHooks from './apps';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  return {
    ...configureAppsHooks(queryClient, queryConfig),
  };
};
