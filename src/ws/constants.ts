/**
 * TODO: use types from graasp-websockets
 */
import { Websocket } from '@graasp/sdk';

/** Namespace for notifications realm */
export const REALM_NOTIF = Websocket.Realms.Notif;

/** Client actions */
const ClientActions = Websocket.ClientActions;
export const CLIENT_ACTION_SUBSCRIBE = ClientActions.Subscribe;
export const CLIENT_ACTION_UNSUBSCRIBE = ClientActions.Unsubscribe;
export const CLIENT_ACTION_SUBSCRIBE_ONLY = ClientActions.SubscribeOnly;
export const CLIENT_ACTION_DISCONNECT = ClientActions.Disconnect;

/** Server message types */
const ServerMessageTypes = Websocket.ServerMessageTypes;
export const SERVER_TYPE_RESPONSE = ServerMessageTypes.Response;
export const SERVER_TYPE_UPDATE = ServerMessageTypes.Update;
export const SERVER_TYPE_INFO = ServerMessageTypes.Info;

/** Server response status */
const ResponseStatuses = Websocket.ResponseStatuses;
export const RESPONSE_STATUS_SUCCESS = ResponseStatuses.Success;
export const RESPONSE_STATUS_ERROR = ResponseStatuses.Error;

/** Error names */
const ErrorNames = Websocket.ErrorNames;
export const ERROR_ACCESS_DENIED = ErrorNames.AccessDenied;
export const ERROR_BAD_REQUEST = ErrorNames.BadRequest;
export const ERROR_NOT_FOUND = ErrorNames.NotFound;
export const ERROR_SERVER_ERROR = ErrorNames.ServerError;

// When SDK will be ready
// const AppTopics = Websocket.AppTopics;
// export const APP_DATA_TOPIC = AppTopics.AppData;
// export const APP_ACTIONS_TOPIC = AppTopics.AppActions;
// export const APP_SETTINGS_TOPIC = AppTopics.AppSettings;

export const APP_DATA_TOPIC = 'app-data';
export const APP_ACTIONS_TOPIC = 'app-actions';
export const APP_SETTINGS_TOPIC = 'app-settings';
