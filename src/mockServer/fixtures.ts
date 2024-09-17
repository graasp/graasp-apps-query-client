import {
  AccountType,
  AppItemFactory,
  AppItemType,
  CompleteMember,
  Context,
  ItemType,
  MemberFactory,
  PermissionLevel,
} from '@graasp/sdk';

import { buildContext } from '../hooks/postMessage';
import { Database, LocalContext } from '../types';

export const MOCK_SERVER_MEMBER: CompleteMember = MemberFactory({
  id: 'mock-member-id',
  name: 'mock-member-name',
  email: 'email@email.com',
  extra: {},
  type: AccountType.Individual,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const MOCK_SERVER_ITEM: AppItemType = AppItemFactory({
  id: 'mock-item-id',
  path: 'mock_item_id',
  name: 'item-name',
  description: '',
  extra: {
    [ItemType.APP]: {
      url: 'myappurl',
    },
  },
  lang: 'en',
  creator: MOCK_SERVER_MEMBER,
  settings: {},
});

export const buildMockLocalContext = (appContext?: Partial<LocalContext>): LocalContext => {
  const context: LocalContext = {
    accountId: MOCK_SERVER_MEMBER.id,
    itemId: MOCK_SERVER_ITEM.id,
    offline: false,
    apiHost: 'http://localhost:3000',
    permission: PermissionLevel.Read,
    context: Context.Player,
    dev: true,
    ...appContext,
  };

  return buildContext(context);
};

export const buildDatabase = ({
  appData = [],
  appActions = [],
  appSettings = [],
  members = [MOCK_SERVER_MEMBER],
  items = [MOCK_SERVER_ITEM],
  uploadedFiles = [],
}: Partial<Database> = {}): Database => ({
  appData,
  appActions,
  appSettings,
  members,
  items,
  uploadedFiles,
});
