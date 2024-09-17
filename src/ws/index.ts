import { QueryClientConfig } from '../types.js';
import { WebsocketClient, configureWebsocketClient } from './ws-client.js';

/**
 * Graasp websocket client top-level file
 * Entry point to use the Graasp WebSocket client in front-end applications
 */
export * from './hooks/index.js';
export { configureWebsocketClient } from './ws-client.js';
export { default as MockWebSocket } from './mock-ws-client.js';

export const getWebsocketClient = (queryConfig: QueryClientConfig): WebsocketClient | undefined => {
  const { enableWebsocket, WS_HOST } = queryConfig;
  if (enableWebsocket && typeof WS_HOST !== 'undefined') {
    return configureWebsocketClient({ ...queryConfig, WS_HOST });
  }
  return undefined;
};
