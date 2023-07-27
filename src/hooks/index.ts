import { QueryClient } from '@tanstack/react-query';
import { QueryClientConfig } from '../types';
import configureAppsHooks from './app';
import configureAppDataHooks from './appData';
import configureAppSettingHooks from './appSetting';
import configureAppActionHooks from './appAction';
import configurePostMessageHooks from './postMessage';
import { WebsocketClient } from '../ws/ws-client';
import { configureWsAppHooks } from '../ws';

export default (
  queryClient: QueryClient,
  queryConfig: QueryClientConfig,
  websocketClient?: WebsocketClient,
) => {
  const wsHooks =
    typeof websocketClient !== 'undefined' ? configureWsAppHooks(websocketClient) : undefined;
  return {
    ...configureAppsHooks(queryClient, queryConfig),
    ...configureAppDataHooks(queryClient, queryConfig, wsHooks?.useAppDataUpdates),
    ...configurePostMessageHooks(queryClient, queryConfig),
    ...configureAppSettingHooks(queryClient, queryConfig),
    ...configureAppActionHooks(queryClient, queryConfig),
  };
};
