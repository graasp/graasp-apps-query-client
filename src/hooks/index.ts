import { QueryClientConfig } from '../types';
import { WebsocketClient } from '../ws/ws-client';
import configureAppsHooks from './app';
import configureAppActionHooks from './appAction';
import configureAppDataHooks from './appData';
import configureAppSettingHooks from './appSetting';
import configurePostMessageHooks from './postMessage';

export default (queryConfig: QueryClientConfig, websocketClient?: WebsocketClient) => ({
  ...configureAppsHooks(queryConfig),
  ...configureAppDataHooks(queryConfig, websocketClient),
  ...configurePostMessageHooks(queryConfig),
  ...configureAppSettingHooks(queryConfig, websocketClient),
  ...configureAppActionHooks(queryConfig, websocketClient),
});
