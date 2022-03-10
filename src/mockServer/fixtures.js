import { CONTEXTS, PERMISSION_LEVELS } from '../config/constants';
import { buildContext } from '../hooks/postMessage';

export const MOCK_SERVER_MEMBER = {
  id: 'mock-member-id',
  name: 'mock-member-name',
};

export const MOCK_SERVER_ITEM = { id: 'mock-item-id', id: 'mock-item-name' };

export const buildMockLocalContext = (appContext = {}) => {
  const context = {
    itemId: MOCK_SERVER_ITEM.id,
    memberId: MOCK_SERVER_MEMBER.id,
    offline: false,
    apiHost: 'http://localhost:3000',
    permission: PERMISSION_LEVELS.READ,
    context: CONTEXTS.PLAYER,
    ...appContext,
  };

  return buildContext(context);
};
