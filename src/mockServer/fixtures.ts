import {
  AppItemType,
  CompleteMember,
  Context,
  ItemType,
  MemberType,
  PermissionLevel,
} from '@graasp/sdk';

import { buildContext } from '../hooks/postMessage';
import { Database, LocalContext } from '../types';

export const MOCK_SERVER_MEMBER: CompleteMember = {
  id: 'mock-member-id',
  name: 'mock-member-name',
  email: 'email@email.com',
  extra: {},
  type: MemberType.Individual,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const MOCK_SERVER_ITEM: AppItemType = {
  id: 'mock-item-id',
  path: 'mock_item_id',
  name: 'item-name',
  description: '',
  extra: {
    [ItemType.APP]: {
      url: 'myappurl',
    },
  },
  type: ItemType.APP,
  createdAt: new Date(),
  updatedAt: new Date(),
  creator: MOCK_SERVER_MEMBER,
  settings: {},
};

export const buildMockLocalContext = (appContext?: Partial<LocalContext>): LocalContext => {
  const context: LocalContext = {
    memberId: MOCK_SERVER_MEMBER.id,
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
  appContext = buildMockLocalContext(),
  appData = [],
  appActions = [],
  appSettings = [],
  members = [MOCK_SERVER_MEMBER],
  items = [MOCK_SERVER_ITEM],
}: Partial<Database> = {}): Database => ({
  appContext,
  appData,
  appActions,
  appSettings,
  members,
  items,
});
