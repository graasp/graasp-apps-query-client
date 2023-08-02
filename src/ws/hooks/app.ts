/**
 * Graasp websocket client
 * React effect hooks to subscribe to real-time updates and mutate query client
 */
import { List } from 'immutable';
import { useEffect } from 'react';

import { UUID, convertJs } from '@graasp/sdk';
import { AppActionRecord, AppDataRecord } from '@graasp/sdk/frontend';

import { Channel, WebsocketClient } from '../ws-client';
import { useQueryClient } from '@tanstack/react-query';
import { buildAppActionsKey, buildAppDataKey } from '../../config/keys';
import { AppActionEvent, AppDataEvent } from '../types';
import { APP_ACTIONS_TOPIC, APP_DATA_TOPIC } from '../constants';

export const configureWsAppHooks = (websocketClient: WebsocketClient) => {
  return {
    /**
     * React hook to subscribe to the updates of the app data for
     * the given item ID.
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
            const appDataList: List<AppDataRecord> | undefined =
              queryClient.getQueryData(appDataKey);
            const newAppData: AppDataRecord = convertJs(event.appData);
            switch (event.op) {
              case 'post': {
                if (appDataList?.findIndex(({ id }) => id === newAppData.id) === -1)
                  queryClient.setQueryData(appDataKey, appDataList?.push(newAppData));
                break;
              }
              case 'patch': {
                const appDataPatchedIndex = appDataList?.findIndex((a) => a.id === newAppData.id);
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
                console.warn('unhandled event for useAppDataUpdates');
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
    /**
     * React hook to subscribe to the updates of the app data for
     * the given item ID.
     * @param itemId The ID of the item of which to observe updates
     */
    useAppActionsUpdates: (itemId?: UUID | null) => {
      const queryClient = useQueryClient();
      useEffect(() => {
        if (!itemId || itemId?.length === 0) {
          return () => {
            // do nothing
            console.warn('No correct itemId provided.');
          };
        }

        const channel: Channel = { name: itemId, topic: APP_ACTIONS_TOPIC };
        const appActionKey = buildAppActionsKey(itemId);

        const handler = (event: AppActionEvent) => {
          if (event.kind === 'app-actions') {
            const appDataList: List<AppActionRecord> | undefined =
              queryClient.getQueryData(appActionKey);
            const newAppAction: AppActionRecord = convertJs(event.appAction);
            switch (event.op) {
              case 'post': {
                if (appDataList?.findIndex(({ id }) => id === newAppAction.id) === -1)
                  queryClient.setQueryData(appActionKey, appDataList?.push(newAppAction));
                break;
              }
              default:
                console.warn('unhandled event for useAppActionsUpdates');
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
  };
};
