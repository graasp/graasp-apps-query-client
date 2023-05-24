import { List, Record } from 'immutable';
import {
  AppAction,
  AppData,
  AppSetting,
  Context,
  Item,
  Member,
  PermissionLevel,
  UUID,
} from '@graasp/sdk';

// generic type
type EnumToUnionType<T> = T extends `${infer R}` ? R : never;

export type Notifier = (e: unknown) => void;

export type Data = { [key: string]: unknown };
export type AppDataData = Data;
export type AppActionData = Data;
export type AppSettingData = Data;

export type Token = string;

export type QueryClientConfig = {
  API_HOST?: string; // set during usecontext
  SHOW_NOTIFICATIONS: boolean;
  notifier?: Notifier;
  staleTime: number;
  cacheTime: number;
  retry?: number | boolean | ((failureCount: number, error: unknown) => boolean);
  refetchOnWindowFocus?: boolean;
  keepPreviousData?: boolean;
  GRAASP_APP_KEY?: string | null;
  shouldRetry?: boolean;
  targetWindow?: Window;

  /**
   * @deprecated Use GRAASP_APP_KEY instead
   */
  GRAASP_APP_ID?: string | null;
};

export class UndefinedArgument extends Error {
  constructor() {
    super();
    this.message = 'UnexpectedInput';
    this.name = 'UnexpectedInput';
    this.stack = new Error().stack;
  }
}

export type WindowPostMessage = (message: unknown) => void;

export type LocalContext = {
  apiHost: string;
  itemId: string;
  memberId?: string;
  settings?: unknown;
  dev?: boolean;
  offline?: boolean;
  lang?: string;
  context?: EnumToUnionType<Context> | 'standalone' | Context;
  standalone?: boolean;
  permission?: string;
};

// todo: maybe adapt these default values to sane defaults
export const LocalContextRecord = Record<LocalContext>({
  apiHost: '',
  itemId: '',
  memberId: undefined,
  settings: {},
  dev: false,
  offline: false,
  lang: 'en',
  context: Context.Builder,
  standalone: false,
  permission: PermissionLevel.Read,
});

export type AppContext = Item & {
  children: List<Item>;
  members: List<Member>;
};

export interface ApiData {
  token: Token;
  itemId: UUID;
  apiHost: string;
}

export interface Database {
  appData: AppData[];
  appActions: AppAction[];
  appSettings: AppSetting[];
  members: Member[];
}
