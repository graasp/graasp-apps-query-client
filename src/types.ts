export type Notifier = (e: unknown) => void;

export type QueryClientConfig = {
  API_HOST: string;
  SHOW_NOTIFICATIONS: boolean;
  notifier?: Notifier;
  staleTime: number;
  cacheTime: number;
  retry: number | boolean | ((failureCount: number, error: Error) => boolean);
  refetchOnWindowFocus?: boolean;
  keepPreviousData?: boolean;
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
  data: unknown;
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

export type Context = {
  members: Member[];
};
