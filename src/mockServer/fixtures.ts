import { Member, MemberType, PermissionLevel, UUID } from '@graasp/sdk';
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


export const buildMockLocalContext = (appContext: Partial<LocalContext> & { itemId: UUID }) => {
  const context: LocalContext = {
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
