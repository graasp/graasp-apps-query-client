import {
  AppAction,
  AppData,
  AppSetting,
  CompleteMember,
  Context,
  DiscriminatedItem,
  Member,
  PermissionLevel,
  UUID,
} from '@graasp/sdk';

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
export type RequiredQueryClientConfig = {
  API_HOST: string;
  GRAASP_APP_KEY: string;
};
export type OptionalQueryClientConfig = {
  SHOW_NOTIFICATIONS: boolean;
  notifier: Notifier;
  staleTime: number;
  cacheTime: number;
  retry: number | boolean | ((failureCount: number, error: unknown) => boolean);
  refetchOnWindowFocus: boolean;
  keepPreviousData: boolean;
  WS_HOST?: string;
  enableWebsocket: boolean;
  isStandalone: boolean;

  /**
   * @deprecated Use GRAASP_APP_KEY instead
   */
  GRAASP_APP_ID?: string | null;
};
export type QueryClientConfig = RequiredQueryClientConfig & OptionalQueryClientConfig;
export type InputQueryClientConfig = RequiredQueryClientConfig & Partial<OptionalQueryClientConfig>;

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
  memberId: UUID;
  settings?: unknown;
  dev?: boolean;
  offline?: boolean;
  lang?: string;
  context: EnumToUnionType<Context> | 'standalone' | Context;
  standalone?: boolean;
  permission: PermissionLevel;
};

export type AppContext = DiscriminatedItem & {
  children: DiscriminatedItem[];
  members: Member[];
};

export interface ApiData {
  token: Token;
  itemId: UUID;
  apiHost: string;
}

export type MockAppData = Omit<AppData, 'item' | 'creator' | 'member'> & {
  itemId: string;
  creatorId: string;
  memberId: string;
};
export type MockAppAction = Omit<AppAction, 'item' | 'member'> & {
  itemId: string;
  memberId: string;
};
export type MockAppSetting = Omit<AppSetting, 'item' | 'creator'> & {
  itemId: string;
  creatorId: string;
};

export interface Database {
  appContext: LocalContext;
  appData: AppData[];
  appActions: AppAction[];
  appSettings: AppSetting[];
  // we pass the members as `CompleteMember` to be able to access all their properties, but they will be exposed as `Member`
  members: CompleteMember[];
  items: DiscriminatedItem[];
}

export type UserDataType = { [key: string]: unknown };
