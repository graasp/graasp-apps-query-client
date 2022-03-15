import { QueryClient } from 'react-query';
import { QueryClientConfig } from '../types';
import appMutations from './apps';
import appSettingMutations from './appSetting';

const configureMutations = (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  appMutations(queryClient, queryConfig);
  appSettingMutations(queryClient, queryConfig);
};

export default configureMutations;
