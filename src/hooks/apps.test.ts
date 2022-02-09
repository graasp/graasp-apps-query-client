import nock from 'nock';
import { v4 } from 'uuid';
import { StatusCodes } from 'http-status-codes';
import { List, Record, Map } from 'immutable';
import { mockHook, setUpTest } from '../../test/utils';
import { buildGetAppDataRoute, buildGetContextRoute } from '../api/routes';
import { AppData, LocalContext } from '../types';
import { buildAppContextKey, buildAppDataKey, LOCAL_CONTEXT_KEY } from '../config/keys';
import {
  FIXTURE_APP_DATA,
  UNAUTHORIZED_RESPONSE,
  FIXTURE_TOKEN,
  FIXTURE_CONTEXT,
  MOCK_LOCAL_CONTEXT,
} from '../../test/constants';
import { MissingApiHostError } from '../config/utils';

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
      // preset context
      queryClient.setQueryData(LOCAL_CONTEXT_KEY, Map(MOCK_LOCAL_CONTEXT));

      const response = FIXTURE_APP_DATA;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as List<AppData>).toJS()).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(List(response));
    });
    it('Cannot fetch app data if context does not exist', async () => {
      const response = FIXTURE_APP_DATA;
      const endpoints = [{ route, response }];
      const { error } = await mockHook({ endpoints, hook, wrapper });

      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
      expect((error as Error).message).toEqual(new MissingApiHostError().message);
    });
    it('Does not fetch if itemId is missing', async () => {
      const response = FIXTURE_APP_DATA;
      const endpoints = [{ route, response }];
      const disabledHook = () => hooks.useAppContext({ token });
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
      const response = FIXTURE_APP_DATA;
      const endpoints = [{ route, response }];
      const disabledHook = () => hooks.useAppContext({ itemId });
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
      queryClient.setQueryData(LOCAL_CONTEXT_KEY, Map(MOCK_LOCAL_CONTEXT));
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
      // preset context
      queryClient.setQueryData(LOCAL_CONTEXT_KEY, Map(MOCK_LOCAL_CONTEXT));

      const response = FIXTURE_CONTEXT;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as Record<LocalContext>).toJS()).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(Map(response));
    });
    it('Cannot fetch context if local context does not exist', async () => {
      const response = FIXTURE_CONTEXT;
      const endpoints = [{ route, response }];
      const { error } = await mockHook({ endpoints, hook, wrapper });

      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
      expect((error as Error).message).toEqual(new MissingApiHostError().message);
    });
    it('Does not fetch if itemId is missing', async () => {
      const response = FIXTURE_CONTEXT;
      const endpoints = [{ route, response }];
      const disabledHook = () => hooks.useAppContext({ token });
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
      const disabledHook = () => hooks.useAppContext({ itemId });
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
      queryClient.setQueryData(LOCAL_CONTEXT_KEY, Map(MOCK_LOCAL_CONTEXT));
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
