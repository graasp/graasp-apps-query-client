import { List, Record } from 'immutable';
import { Context, PermissionLevel } from '@graasp/sdk';

// generic type
type EnumToUnionType<T> = T extends `${infer R}` ? R : never;

// Has to match with https://github.com/graasp/graasp-apps/blob/main/src/interfaces/app-details.ts
export enum AppDataVisibility {
  ITEM = 'item',
  MEMBER = 'member',
}

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
  retry?: number | boolean | ((failureCount: number, error: Error) => boolean);
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

// Graasp Core Types
// todo: use graasp-types

export type UUID = string;

export type Item = {
  id: UUID;
  name: string;
  path: string;
  type: string;
  description: string;
  extra: unknown;
};

type MemberExtra = {
  recycleBin?: {
    itemId: string;
  };
};

export type Member = {
  id: UUID;
  name: string;
  email: string;
  extra: MemberExtra;
};

export type AppData = {
  id: UUID;
  data: AppDataData;
  type: string;
  creator: string;
  createdAt: string;
  updatedAt: string;
  memberId: UUID;
  itemId: UUID;
  visibility: `${AppDataVisibility}` | AppDataVisibility;
};

export type AppAction = {
  id: UUID;
  type: string;
  data: AppActionData;
  memberId: UUID;
  itemId: UUID;
  createdAt: string;
};

export type AppSetting = {
  itemId: UUID;
  id: UUID;
  data: AppSettingData;
  name: string;
  creator: string;
  createdAt: string;
  updatedAt: string;
};

export class UndefinedArgument extends Error {
  constructor() {
    super();
    this.message = 'UnexpectedInput';
    this.name = 'UnexpectedInput';
    this.stack = new Error().stack;
  }
}
// todo: get from graasp types
export type GraaspError = {
  name: string;
  code: string;
  statusCode?: number;
  message: string;
  data?: unknown;
};

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
  memberId: '',
  settings: {},
  dev: false,
  offline: false,
  lang: 'en',
  context: Context.BUILDER,
  standalone: false,
  permission: PermissionLevel.Read,
});

export type AppContext = Item & {
  children: List<Item>;
  members: List<Member>;
};

export const AppContextRecord = Record<AppContext>({
  id: '',
  name: '',
  path: '',
  description: '',
  type: '',
  extra: {},
  children: List<Item>(),
  members: List<Member>(),
});

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
