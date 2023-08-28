import {
  AppAction,
  AppData,
  AppSetting,
  Context,
  CurrentMember,
  DiscriminatedItem,
  Member,
  PermissionLevel,
  UUID,
} from '@graasp/sdk';
import { ImmutableCast } from '@graasp/sdk/frontend';

// generic type
type EnumToUnionType<T> = T extends `${infer R}` ? R : never;

export type Notifier = (e: {
  type: string;
  payload?: { error?: Error; message?: string; [key: string]: unknown };
}) => void;

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
  WS_HOST?: string;
  enableWebsocket?: boolean;

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
  itemId: UUID;
  memberId?: UUID;
  settings?: unknown;
  dev?: boolean;
  offline?: boolean;
  lang?: string;
  context?: EnumToUnionType<Context> | 'standalone' | Context;
  standalone?: boolean;
  permission?: PermissionLevel;
};

export type LocalContextRecord = ImmutableCast<LocalContext>;

export type AppContext = DiscriminatedItem & {
  children: DiscriminatedItem[];
  members: Member[];
};

export type AppContextRecord = ImmutableCast<AppContext>;

export interface ApiData {
  token: Token;
  itemId: UUID;
  apiHost: string;
}

export interface Database {
  appData: AppData[];
  appActions: AppAction[];
  appSettings: AppSetting[];
  // we pass the members as `CurrentMember` to be able to access all their properties, but they will be exposed as `Member`
  members: CurrentMember[];
  items: DiscriminatedItem[];
}

export type UserDataType = { [key: string]: unknown };