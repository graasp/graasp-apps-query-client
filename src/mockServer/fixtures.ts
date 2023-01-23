import { PermissionLevel } from '@graasp/sdk';
import { buildContext } from '../hooks/postMessage';
import { LocalContext, Member } from '../types';
import { Context } from '@graasp/sdk';

export const MOCK_SERVER_MEMBER: Member = {
  id: 'mock-member-id',
  name: 'mock-member-name',
  email: 'email@email.com',
  extra: {},
};

export const MOCK_SERVER_ITEM = { id: 'mock-item-id', name: 'mock-item-name' };

export const buildMockLocalContext = (appContext = {}) => {
  const context: LocalContext = {
    itemId: MOCK_SERVER_ITEM.id,
    memberId: MOCK_SERVER_MEMBER.id,
    offline: false,
    apiHost: 'http://localhost:3000',
    permission: PermissionLevel.Read,
    context: Context.PLAYER,
    dev: true,
    ...appContext,
  };

  return buildContext(context);
};
