/**
 * Graasp websocket client
 * React effect hooks to subscribe to real-time updates and mutate query client
 */
import { useEffect } from 'react';

import { AppAction, AppData, AppSetting, UUID } from '@graasp/sdk';

import { useQueryClient } from '@tanstack/react-query';

import { APP_ACTIONS_TOPIC, APP_DATA_TOPIC, APP_SETTINGS_TOPIC } from '../../config/constants';
import { appSettingKeys, buildAppActionsKey, buildAppDataKey } from '../../config/keys';
import {
  AppActionEvent,
  AppDataEvent,
  AppEventKinds,
  AppOperations,
  AppSettingEvent,
} from '../types';
import { Channel, WebsocketClient } from '../ws-client';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const configureWsAppDataHooks = (websocketClient?: WebsocketClient) => ({
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
        return () => undefined;
      }
      if (!itemId) {
        // do nothing
        return () => undefined;
      }

      const channel: Channel = { name: itemId, topic: APP_DATA_TOPIC };
      const appDataKey = buildAppDataKey(itemId);

      const handler = (event: AppDataEvent): void => {
        if (event.kind === AppEventKinds.AppData) {
          const appDataList = queryClient.getQueryData<AppData[]>(appDataKey);
          const newAppData: AppData = event.appData;
          switch (event.op) {
            case AppOperations.POST: {
              if (!appDataList?.some(({ id }) => id === newAppData.id))
                queryClient.setQueryData(
                  appDataKey,
                  appDataList ? [...(appDataList ?? []), newAppData] : [newAppData],
                );
              break;
            }
            case AppOperations.PATCH: {
              if (appDataList) {
                const appDataPatchedIndex = appDataList.findIndex((a) => a.id === newAppData.id);
                if (appDataPatchedIndex >= 0) {
                  queryClient.setQueryData(appDataKey, [
                    ...appDataList.slice(0, appDataPatchedIndex),
                    newAppData,
                    ...appDataList.slice(appDataPatchedIndex, appDataList.length),
                  ]);
                }
              }
              break;
            }
            case AppOperations.DELETE: {
              queryClient.setQueryData(
                appDataKey,
                appDataList?.filter(({ id }) => id !== newAppData.id),
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

      return () => {
        websocketClient.unsubscribe(channel, handler);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemId]);
  },
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const configureWsAppActionsHooks = (websocketClient?: WebsocketClient) => ({
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
        return () => undefined;
      }
      if (!itemId) {
        // do nothing
        return () => undefined;
      }

      const channel: Channel = { name: itemId, topic: APP_ACTIONS_TOPIC };
      const appActionKey = buildAppActionsKey(itemId);

      const handler = (event: AppActionEvent): void => {
        if (event.kind === AppEventKinds.AppActions) {
          const appActionsList = queryClient.getQueryData<AppAction[]>(appActionKey);
          const newAppAction: AppAction = event.appAction;
          switch (event.op) {
            case AppOperations.POST: {
              if (!appActionsList?.some(({ id }) => id === newAppAction.id)) {
                queryClient.setQueryData(
                  appActionKey,
                  appActionsList ? [...(appActionsList ?? []), newAppAction] : [newAppAction],
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

      return () => {
        websocketClient.unsubscribe(channel, handler);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemId]);
  },
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const configureWsAppSettingHooks = (websocketClient?: WebsocketClient) => ({
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
        return () => undefined;
      }
      if (!itemId) {
        // do nothing
        return () => undefined;
      }

      const channel: Channel = { name: itemId, topic: APP_SETTINGS_TOPIC };
      const appSettingsKey = appSettingKeys.singleId(itemId);

      const handler = (event: AppSettingEvent): void => {
        if (event.kind === AppEventKinds.AppSettings) {
          const appSettingList = queryClient.getQueryData<AppSetting[]>(appSettingsKey);
          const newAppSetting: AppSetting = event.appSetting;
          switch (event.op) {
            case AppOperations.POST: {
              if (!appSettingList?.some(({ id }) => id === newAppSetting.id)) {
                queryClient.setQueryData(
                  appSettingsKey,
                  appSettingList ? [...(appSettingList ?? []), newAppSetting] : [newAppSetting],
                );
              }
              break;
            }
            case AppOperations.PATCH: {
              if (appSettingList) {
                const appSettingPatchedIndex = appSettingList.findIndex(
                  (a) => a.id === newAppSetting.id,
                );
                if (appSettingPatchedIndex >= 0) {
                  queryClient.setQueryData(appSettingsKey, [
                    ...appSettingList.slice(0, appSettingPatchedIndex),
                    newAppSetting,
                    ...appSettingList.slice(appSettingPatchedIndex, appSettingList.length),
                  ]);
                }
              }
              break;
            }
            case AppOperations.DELETE: {
              queryClient.setQueryData(
                appSettingsKey,
                appSettingList?.filter(({ id }) => id !== newAppSetting.id),
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemId]);
  },
});
