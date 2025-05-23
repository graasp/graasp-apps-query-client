import {
  AppAction,
  AppData,
  AppSetting,
  CompleteMember,
  DiscriminatedItem,
  Member,
  UUID,
} from '@graasp/sdk';

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
   * Time in milliseconds for debouncing the autoresize hook defined in {@link postMessage}.
   * Sending the height from the app to the parent window will be delayed until after
   * `debounceTimeAutoResize` milliseconds have elapsed since the last time the height was
   * sent.
   * @see {@link https://lodash.com/docs/#debounce}
   */
  debounceTimeAutoResize: number;

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

export type AppContext = {
  item: DiscriminatedItem;
  members: Member[];
};

export interface ApiData {
  token: Token;
  itemId: UUID;
  apiHost: string;
}

export type MockAppData = Omit<AppData, 'item' | 'creator' | 'account'> & {
  itemId: string;
  creatorId: string;
  accountId: string;
};
export type MockAppAction = Omit<AppAction, 'item' | 'account'> & {
  itemId: string;
  accountId: string;
};
export type MockAppSetting = Omit<AppSetting, 'item' | 'creator'> & {
  itemId: string;
  creatorId: string;
};
export type MockUploadedFile = { id: string; file: File };

export interface Database {
  appData: AppData[];
  appActions: AppAction[];
  appSettings: AppSetting[];
  // we pass the members as `CompleteMember` to be able to access all their properties, but they will be exposed as `Member`
  members: CompleteMember[];
  items: DiscriminatedItem[];
  // allows to mock uploaded files normally stored in AWS
  uploadedFiles: MockUploadedFile[];
}

export type ChatBotCompletion = {
  completion: string;
  model: string;
};

export interface ChatbotThreadMessage {
  // represent the appDataTypes of the chatbot in the current app
  botDataType: string;
  msgType: string;
  data: string;
}
