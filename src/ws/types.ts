import { AppAction, AppData, AppSetting } from '@graasp/sdk';

// should probably go to sdk
export type AppOperations = 'post' | 'patch' | 'delete';

// should probably go to sdk
export type AppEventKinds = 'app-data' | 'app-settings' | 'app-actions';

/**
 * All websocket events for app will have this shape
 * should probably go to sdk
 */
export interface AppEvent {
  kind: AppEventKinds;
  op: AppOperations;
}

/**
 * Events that affect an app data
 * should probably go to sdk
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
