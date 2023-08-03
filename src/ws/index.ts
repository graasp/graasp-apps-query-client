import { QueryClientConfig } from '../types';
import { WebsocketClient, configureWebsocketClient } from './ws-client';

/**
 * Graasp websocket client top-level file
 * Entry point to use the Graasp WebSocket client in front-end applications
 */
export * from './hooks';
export { configureWebsocketClient } from './ws-client';
export { default as MockWebSocket } from './mock-ws-client';

export const getWebsocketClient = (queryConfig: QueryClientConfig): WebsocketClient | undefined => {
  const { enableWebsocket, WS_HOST } = queryConfig;
  if (enableWebsocket && typeof WS_HOST !== 'undefined') {
    return configureWebsocketClient({ ...queryConfig, WS_HOST });
  }
  return;
};
