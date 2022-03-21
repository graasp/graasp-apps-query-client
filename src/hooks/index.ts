import { QueryClient } from 'react-query';
import { QueryClientConfig } from '../types';
import configureAppsHooks from './apps';
import configureAppSettingHooks from './appSetting';
import configurePostMessageHooks from './postMessage';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  return {
    ...configureAppsHooks(queryClient, queryConfig),
    ...configurePostMessageHooks(queryClient, queryConfig),
    ...configureAppSettingHooks(queryClient, queryConfig),
  };
};
