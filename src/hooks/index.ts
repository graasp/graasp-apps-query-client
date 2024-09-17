import { QueryClientConfig } from '../types.js';
import { WebsocketClient } from '../ws/ws-client.js';
import configureAppsHooks from './app.js';
import configureAppActionHooks from './appAction.js';
import configureAppDataHooks from './appData.js';
import configureAppSettingHooks from './appSetting.js';
import configurePostMessageHooks from './postMessage.js';

const configHooks = (queryConfig: QueryClientConfig, websocketClient?: WebsocketClient) => ({
  ...configureAppsHooks(queryConfig),
  ...configureAppDataHooks(queryConfig, websocketClient),
  ...configurePostMessageHooks(queryConfig),
  ...configureAppSettingHooks(queryConfig, websocketClient),
  ...configureAppActionHooks(queryConfig, websocketClient),
});

export default configHooks;
