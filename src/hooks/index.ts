import { QueryClient } from '@tanstack/react-query';
import { QueryClientConfig } from '../types';
import configureAppsHooks from './app';
import configureAppDataHooks from './appData';
import configureAppSettingHooks from './appSetting';
import configureAppActionHooks from './appAction';
import configurePostMessageHooks from './postMessage';
import { WebsocketClient } from '../ws/ws-client';

export default (
  queryClient: QueryClient,
  queryConfig: QueryClientConfig,
  websocketClient?: WebsocketClient,
) => {
  return {
    ...configureAppsHooks(queryClient, queryConfig),
    ...configureAppDataHooks(queryClient, queryConfig, websocketClient),
    ...configurePostMessageHooks(queryClient, queryConfig),
    ...configureAppSettingHooks(queryClient, queryConfig, websocketClient),
    ...configureAppActionHooks(queryClient, queryConfig, websocketClient),
  };
};
