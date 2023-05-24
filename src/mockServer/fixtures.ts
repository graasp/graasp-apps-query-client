import { Item, Member, MemberType, PermissionLevel } from '@graasp/sdk';
import { buildContext } from '../hooks/postMessage';
import { LocalContext } from '../types';
import { Context } from '@graasp/sdk';

export const MOCK_SERVER_MEMBER: Member = {
  id: 'mock-member-id',
  name: 'mock-member-name',
  email: 'email@email.com',
  extra: {},
  type: MemberType.Individual,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const MOCK_SERVER_ITEM: Item = {
  id: 'mock-item-id',
  name: 'mock-item-name',
  description: '',
  path: 'item_path',
  settings: {},
  creator: MOCK_SERVER_MEMBER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const buildMockLocalContext = (appContext = {}) => {
  const context: LocalContext = {
    itemId: MOCK_SERVER_ITEM.id,
    memberId: MOCK_SERVER_MEMBER.id,
    offline: false,
    apiHost: 'http://localhost:3000',
    permission: PermissionLevel.Read,
    context: Context.Player,
    dev: true,
    ...appContext,
  };

  return buildContext(context);
};
