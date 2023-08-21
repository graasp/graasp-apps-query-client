/**
 * All the type definitions should be moved to @graasp/sdk
 */

import { AppAction, AppData, AppSetting } from '@graasp/sdk';

export enum AppOperations {
  POST = 'post',
  PATCH = 'patch',
  DELETE = 'delete',
}

export type AppOperation = AppOperations | `${AppOperations}`;

export enum AppEventKinds {
  AppData = 'app-data',
  AppSettings = 'app-settings',
  AppActions = 'app-actions',
}

export type AppEventKind = AppEventKinds | `${AppEventKinds}`;

/**
 * All websocket events for app will have this shape
 */
export interface AppEvent {
  kind: AppEventKind;
  op: AppOperation;
}

/**
 * Events that affect an app data
 */
export interface AppDataEvent extends AppEvent {
  kind: AppEventKinds.AppData;
  appData: AppData;
}

/**
 * Events that affect an app action
 */
export interface AppActionEvent extends AppEvent {
  kind: AppEventKinds.AppActions;
  appAction: AppAction;
}

/**
 * Events that affect an app setting
 */
export interface AppSettingEvent extends AppEvent {
  kind: AppEventKinds.AppSettings;
  appSetting: AppSetting;
}
