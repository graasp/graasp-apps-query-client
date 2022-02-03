import { QueryClient } from 'react-query';
import { QueryClientConfig } from '../types';
import appMutations from './apps';

const configureMutations = (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  appMutations(queryClient, queryConfig);
};

export default configureMutations;
