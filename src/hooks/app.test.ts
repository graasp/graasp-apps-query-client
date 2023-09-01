import { convertJs } from '@graasp/sdk';

import { StatusCodes } from 'http-status-codes';
import { Record } from 'immutable';
import nock from 'nock';
import { v4 } from 'uuid';

import {
  FIXTURE_CONTEXT,
  UNAUTHORIZED_RESPONSE,
  buildMockLocalContext,
} from '../../test/constants';
import { mockHook, setUpTest } from '../../test/utils';
import { buildGetContextRoute } from '../api/routes';
import { MOCK_TOKEN } from '../config/constants';
import { AUTH_TOKEN_KEY, LOCAL_CONTEXT_KEY, buildAppContextKey } from '../config/keys';
import { MissingApiHostError } from '../config/utils';
import { LocalContext } from '../types';

const { hooks, wrapper, queryClient } = setUpTest();
const itemId = v4();

describe('App Hooks', () => {
  beforeEach(() => {
    queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
    queryClient.setQueryData(LOCAL_CONTEXT_KEY, convertJs(buildMockLocalContext({ itemId })));
  });

  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useAppContext', () => {
    const key = buildAppContextKey(itemId);
    const route = `/${buildGetContextRoute(itemId)}`;
    const hook = () => hooks.useAppContext();

    it('Receive app context', async () => {
      // preset context
      const response = FIXTURE_CONTEXT;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as Record<LocalContext>).toJS()).toEqual(response);

      // verify cache keys
      expect((queryClient.getQueryData(key) as Record<LocalContext>).toJS()).toEqual(response);
    });
    it('Cannot fetch context if local context does not exist', async () => {
      const response = FIXTURE_CONTEXT;
      const endpoints = [{ route, response }];
      try {
        await mockHook({ endpoints, hook, wrapper, enabled: false });
      } catch (error) {
        // verify cache keys
        expect(queryClient.getQueryData(key)).toBeFalsy();
        expect((error as Error).message).toEqual(new MissingApiHostError().message);
      }
    });
    it('Does not fetch if itemId is missing', async () => {
      const response = FIXTURE_CONTEXT;
      const endpoints = [{ route, response }];
      const disabledHook = () => hooks.useAppContext();
      const { isFetched } = await mockHook({
        endpoints,
        hook: disabledHook,
        wrapper,
        enabled: false,
      });

      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
      expect(isFetched).toBeFalsy();
    });
    it('Does not fetch if token is missing', async () => {
      const response = FIXTURE_CONTEXT;
      const endpoints = [{ route, response }];
      const disabledHook = () => hooks.useAppContext();
      const { isFetched } = await mockHook({
        endpoints,
        hook: disabledHook,
        wrapper,
        enabled: false,
      });

      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
      expect(isFetched).toBeFalsy();
    });
    it('Unauthorized', async () => {
      // preset context
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];
      const { data, isError } = await mockHook({
        hook,
        wrapper,
        endpoints,
      });

      expect(data).toBeFalsy();
      expect(isError).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });
  });
});
