import { QueryClient } from 'react-query';
import { QueryClientConfig } from '../types';
import appMutations from './appData';
import appSettingMutations from './appSetting';
import appActionMutations from './appAction';

const configureMutations = (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  appMutations(queryClient, queryConfig);
  appSettingMutations(queryClient, queryConfig);
  appActionMutations(queryClient, queryConfig);
};

export default configureMutations;
