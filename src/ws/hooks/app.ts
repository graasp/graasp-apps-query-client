/**
 * Graasp websocket client
 * React effect hooks to subscribe to real-time updates and mutate query client
 */
import { List } from 'immutable';
import { useEffect } from 'react';

import { UUID } from '@graasp/sdk';
import { AppDataRecord } from '@graasp/sdk/frontend';

import { Channel, WebsocketClient } from '../ws-client';
import { useQueryClient } from '@tanstack/react-query';
import { buildAppDataKey } from '../../config/keys';
import { AppDataEvent } from '../types';
import { APP_DATA_TOPIC } from '../constants';

export const configureWsAppHooks = (websocketClient: WebsocketClient) => ({
  
  /**
   * React hook to subscribe to the updates of the given item ID
   * @param itemId The ID of the item of which to observe updates
   */
  useAppDataUpdates: (itemId?: UUID | null) => {
    const queryClient = useQueryClient();
    useEffect(() => {
      if (!itemId || itemId?.length === 0) {
        return () => {
          // do nothing
          console.warn('No correct itemId provided.');
        };
      }

      const channel: Channel = { name: itemId, topic: APP_DATA_TOPIC };
      const appDataKey = buildAppDataKey(itemId);

      const handler = (event: AppDataEvent) => {
        if (event.kind === 'app-data') {
          const appDataList: List<AppDataRecord> | undefined = queryClient.getQueryData(appDataKey);
          const newAppData: AppDataRecord = event.appData;
          switch (event.op) {
            case 'post': {
              queryClient.setQueryData(appDataKey, appDataList?.push(newAppData));
              break;
            }
            case 'patch': {
              const appDataPatchedIndex =
                appDataList?.findIndex((a) => a.id === newAppData.id);
              if (typeof appDataPatchedIndex !== 'undefined' && appDataPatchedIndex >= 0)
                queryClient.setQueryData(
                  appDataKey,
                  appDataList?.set(appDataPatchedIndex, newAppData),
                );
              break;
            }
            case 'delete': {
              const appDataDeletedIndex =
                appDataList?.findIndex((a) => a.id === newAppData.id) || -1;
              if (appDataDeletedIndex >= 0)
                queryClient.setQueryData(appDataKey, appDataList?.delete(appDataDeletedIndex));
              break;
            }
            default:
              console.error('unhandled event for useAppDataUpdates');
              break;
          }
        }
      };
      websocketClient.subscribe(channel, handler);

      return function cleanup() {
        websocketClient.unsubscribe(channel, handler);
      };
    }, [itemId]);
  },
});
