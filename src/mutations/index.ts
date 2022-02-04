import { QueryClient } from 'react-query';
import { QueryClientConfig } from '../types';
import appMutations from './apps';

const configureMutations = (queryClient: QueryClient, _queryConfig: QueryClientConfig) => {
  appMutations(queryClient);
};

export default configureMutations;
