import nock from 'nock';
import { v4 } from 'uuid';
import { StatusCodes } from 'http-status-codes';
import { List, Record, Map } from 'immutable';
import { mockHook, setUpTest } from '../../test/utils';
import { buildGetAppDataRoute, buildGetContextRoute } from '../api/routes';
import { AppData, Context } from '../types';
import { buildAppContextKey, buildAppDataKey } from '../config/keys';
import {
  FIXTURE_APP_DATA,
  UNAUTHORIZED_RESPONSE,
  FIXTURE_TOKEN,
  FIXTURE_CONTEXT,
} from '../../test/constants';

const { hooks, wrapper, queryClient } = setUpTest();
const token = FIXTURE_TOKEN;

describe('App Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useAppData', () => {
    const itemId = v4();
    const key = buildAppDataKey(itemId);
    const route = `/${buildGetAppDataRoute(itemId)}`;
    const hook = () => hooks.useAppData({ itemId, token });

    it('Receive app data', async () => {
      const response = FIXTURE_APP_DATA;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as List<AppData>).toJS()).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(List(response));
    });
    it('Unauthorized', async () => {
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

  describe('useAppContext', () => {
    const itemId = v4();
    const key = buildAppContextKey(itemId);
    const route = `/${buildGetContextRoute(itemId)}`;
    const hook = () => hooks.useAppContext({ itemId, token });

    it('Receive app context', async () => {
      const response = FIXTURE_CONTEXT;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as Record<Context>).toJS()).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(Map(response));
    });

    it('Unauthorized', async () => {
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
