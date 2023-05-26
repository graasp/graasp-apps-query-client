import { QueryClient } from '@tanstack/react-query';
import { QueryClientConfig } from '../types';
import configureAppsHooks from './app';
import configureAppDataHooks from './appData';
import configureAppSettingHooks from './appSetting';
import configureAppActionHooks from './appAction';
import configurePostMessageHooks from './postMessage';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  return {
    ...configureAppsHooks(queryClient, queryConfig),
    ...configureAppDataHooks(queryClient, queryConfig),
    ...configurePostMessageHooks(queryClient, queryConfig),
    ...configureAppSettingHooks(queryClient, queryConfig),
    ...configureAppActionHooks(queryClient, queryConfig),
  };
};
