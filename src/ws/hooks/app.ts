/**
 * Graasp websocket client
 * React effect hooks to subscribe to real-time updates and mutate query client
 */
import { List } from 'immutable';
import { useEffect } from 'react';

import { UUID, convertJs } from '@graasp/sdk';
import { AppActionRecord, AppDataRecord, AppSettingRecord } from '@graasp/sdk/frontend';

import { Channel, WebsocketClient } from '../ws-client';
import { useQueryClient } from '@tanstack/react-query';
import { buildAppActionsKey, buildAppDataKey, buildAppSettingsKey } from '../../config/keys';
import {
  AppActionEvent,
  AppDataEvent,
  AppEventKinds,
  AppOperations,
  AppSettingEvent,
} from '../types';
import { APP_ACTIONS_TOPIC, APP_DATA_TOPIC, APP_SETTINGS_TOPIC } from '../../config/constants';

export const configureWsAppDataHooks = (websocketClient?: WebsocketClient) => {
  return {
    /**
     * React hook to subscribe to the updates of the app data for
     * the given item ID.
     * @param itemId The ID of the item of which to observe updates
     */
    useAppDataUpdates: (itemId?: UUID | null) => {
      const queryClient = useQueryClient();
      useEffect(() => {
        if (!websocketClient) {
          // do nothing
          console.warn('No websocket client was provided.');
          return;
        }
        if (!itemId) {
          // do nothing
          console.warn('No correct itemId provided.');
          return;
        }

        const channel: Channel = { name: itemId, topic: APP_DATA_TOPIC };
        const appDataKey = buildAppDataKey(itemId);

        const handler = (event: AppDataEvent) => {
          if (event.kind === AppEventKinds.AppData) {
            const appDataList: List<AppDataRecord> | undefined =
              queryClient.getQueryData(appDataKey);
            const newAppData: AppDataRecord = convertJs(event.appData);
            switch (event.op) {
              case AppOperations.POST: {
                if (!appDataList?.some(({ id }) => id === newAppData.id))
                  queryClient.setQueryData(
                    appDataKey,
                    appDataList ? appDataList.push(newAppData) : List.of(newAppData),
                  );
                break;
              }
              case AppOperations.PATCH: {
                const appDataPatchedIndex = appDataList?.findIndex((a) => a.id === newAppData.id);
                if (typeof appDataPatchedIndex !== 'undefined' && appDataPatchedIndex >= 0) {
                  queryClient.setQueryData(
                    appDataKey,
                    appDataList?.set(appDataPatchedIndex, newAppData),
                  );
                }
                break;
              }
              case AppOperations.DELETE: {
                queryClient.setQueryData(
                  appDataKey,
                  appDataList?.filterNot(({ id }) => id === newAppData.id),
                );
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
  };
};

export const configureWsAppActionsHooks = (websocketClient?: WebsocketClient) => {
  return {
    /**
     * React hook to subscribe to the updates of the app data for
     * the given item ID.
     * @param itemId The ID of the item of which to observe updates
     */
    useAppActionsUpdates: (itemId?: UUID | null) => {
      const queryClient = useQueryClient();
      useEffect(() => {
        if (!websocketClient) {
          // do nothing
          console.warn('No websocket client was provided.');
          return;
        }
        if (!itemId) {
          // do nothing
          console.warn('No correct itemId provided.');
          return;
        }

        const channel: Channel = { name: itemId, topic: APP_ACTIONS_TOPIC };
        const appActionKey = buildAppActionsKey(itemId);

        const handler = (event: AppActionEvent) => {
          if (event.kind === AppEventKinds.AppActions) {
            const appActionsList: List<AppActionRecord> | undefined =
              queryClient.getQueryData(appActionKey);
            const newAppAction: AppActionRecord = convertJs(event.appAction);
            switch (event.op) {
              case AppOperations.POST: {
                if (!appActionsList?.some(({ id }) => id === newAppAction.id)) {
                  queryClient.setQueryData(
                    appActionKey,
                    appActionsList ? appActionsList.push(newAppAction) : List.of(newAppAction),
                  );
                }
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

export const configureWsAppSettingHooks = (websocketClient?: WebsocketClient) => {
  return {
    /**
     * React hook to subscribe to the updates of the app data for
     * the given item ID.
     * @param itemId The ID of the item of which to observe updates
     */
    useAppSettingsUpdates: (itemId?: UUID | null) => {
      const queryClient = useQueryClient();
      useEffect(() => {
        if (!websocketClient) {
          // do nothing
          console.warn('No websocket client was provided.');
          return;
        }
        if (!itemId) {
          // do nothing
          console.warn('No correct itemId provided.');
          return;
        }

        const channel: Channel = { name: itemId, topic: APP_SETTINGS_TOPIC };
        const appSettingsKey = buildAppSettingsKey(itemId);

        const handler = (event: AppSettingEvent) => {
          if (event.kind === AppEventKinds.AppSettings) {
            const appSettingList: List<AppSettingRecord> | undefined =
              queryClient.getQueryData(appSettingsKey);
            const newAppSetting: AppSettingRecord = convertJs(event.appSetting);
            switch (event.op) {
              case AppOperations.POST: {
                if (!appSettingList?.some(({ id }) => id === newAppSetting.id)) {
                  queryClient.setQueryData(
                    appSettingsKey,
                    appSettingList ? appSettingList.push(newAppSetting) : List.of(newAppSetting),
                  );
                }
                break;
              }
              case AppOperations.PATCH: {
                const appSettingPatchedIndex = appSettingList?.findIndex(
                  (a) => a.id === newAppSetting.id,
                );
                if (typeof appSettingPatchedIndex !== 'undefined' && appSettingPatchedIndex >= 0) {
                  queryClient.setQueryData(
                    appSettingsKey,
                    appSettingList?.set(appSettingPatchedIndex, newAppSetting),
                  );
                }
                break;
              }
              case AppOperations.DELETE: {
                queryClient.setQueryData(
                  appSettingsKey,
                  appSettingList?.filterNot(({ id }) => id === newAppSetting.id),
                );
                break;
              }
              default:
                console.warn('unhandled event for useAppSettingUpdates');
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
