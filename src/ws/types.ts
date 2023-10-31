/**
 * All the type definitions should be moved to @graasp/sdk
 */
import { AppAction, AppData, AppSetting, UnionOfConst } from '@graasp/sdk';

export enum AppOperations {
  POST = 'post',
  PATCH = 'patch',
  DELETE = 'delete',
}

export type AppOperation = AppOperations | `${AppOperations}`;

export const AppEventKinds = {
  AppData: 'app-data',
  AppSettings: 'app-settings',
  AppActions: 'app-actions',
} as const;

export type AppEventKind = UnionOfConst<typeof AppEventKinds>;

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
  kind: typeof AppEventKinds.AppData;
  appData: AppData;
}

/**
 * Events that affect an app action
 */
export interface AppActionEvent extends AppEvent {
  kind: typeof AppEventKinds.AppActions;
  appAction: AppAction;
}

/**
 * Events that affect an app setting
 */
export interface AppSettingEvent extends AppEvent {
  kind: typeof AppEventKinds.AppSettings;
  appSetting: AppSetting;
}
