export type Notifier = (e: unknown) => void;

export type QueryClientConfig = {
  API_HOST?: string; // set during usecontext
  SHOW_NOTIFICATIONS: boolean;
  notifier?: Notifier;
  staleTime: number;
  cacheTime: number;
  retry?: number | boolean | ((failureCount: number, error: Error) => boolean);
  refetchOnWindowFocus?: boolean;
  keepPreviousData?: boolean;
  GRAASP_APP_ID?: string | null;
  shouldRetry?: boolean;
  targetWindow?: Window;
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
  data: any;
};

export type AppAction = {
  id: UUID;
  type: string;
  data: unknown;
};

export type AppSetting = {
  id: UUID;
  data: unknown;
  name: string;
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

// todo: factor out in graasp-constants
export enum Context {
  PLAYER = 'player',
  BUILDER = 'builder',
  ANALYZER = 'analyzer',
  EXPLORER = 'explorer',
}
export enum PermissionLevel {
  ADMIN = 'admin',
  READ = 'read',
  WRITE = 'write',
}

export type LocalContext = {
  apiHost: string;
  itemId: string;
  memberId?: string;
  settings?: unknown;
  dev?: string;
  offline?: string;
  lang?: string;
  context?: Context;
  permission?: string;
};
