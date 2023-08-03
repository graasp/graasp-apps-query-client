/**
 * All the type definitions should be moved to @graasp/sdk
 */

import { AppAction, AppData, AppSetting } from '@graasp/sdk';

export type AppOperations = 'post' | 'patch' | 'delete';

export type AppEventKinds = 'app-data' | 'app-settings' | 'app-actions';

/**
 * All websocket events for app will have this shape
 */
export interface AppEvent {
  kind: AppEventKinds;
  op: AppOperations;
}

/**
 * Events that affect an app data
 */
export interface AppDataEvent extends AppEvent {
  kind: 'app-data';
  appData: AppData;
}

/**
 * Events that affect an app action
 */
export interface AppActionEvent extends AppEvent {
  kind: 'app-actions';
  appAction: AppAction;
}

/**
 * Events that affect an app setting
 */
export interface AppSettingEvent extends AppEvent {
  kind: 'app-settings';
  appSetting: AppSetting;
}
