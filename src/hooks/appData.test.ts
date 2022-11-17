import { StatusCodes } from 'http-status-codes';
import { List, Map, Record } from 'immutable';
import nock from 'nock';
import { v4 } from 'uuid';
import {
  buildMockLocalContext,
  FIXTURE_APP_DATA,
  FIXTURE_CONTEXT,
  S3_FILE_BLOB_RESPONSE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { Endpoint, mockHook, setUpTest } from '../../test/utils';
import { buildDownloadFilesRoute, buildGetAppDataRoute, buildGetContextRoute } from '../api/routes';
import { MOCK_TOKEN } from '../config/constants';
import {
  AUTH_TOKEN_KEY,
  buildAppContextKey,
  buildAppDataKey,
  buildFileContentKey,
  LOCAL_CONTEXT_KEY,
} from '../config/keys';
import { MissingApiHostError } from '../config/utils';
import { AppData, LocalContext } from '../types';

const { hooks, wrapper, queryClient } = setUpTest();
const itemId = v4();

describe('App Hooks', () => {
  beforeEach(() => {
    queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
    queryClient.setQueryData(LOCAL_CONTEXT_KEY, Map(buildMockLocalContext({ itemId })));
  });

  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useAppData', () => {
    const key = buildAppDataKey(itemId);
    const route = `/${buildGetAppDataRoute(itemId)}`;
    const hook = () => hooks.useAppData();

    it('Receive app data', async () => {
      const response = FIXTURE_APP_DATA;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as List<AppData>).toJS()).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(List(response));
    });
    it('Cannot fetch app data if context does not exist', async () => {
      queryClient.setQueryData(
        LOCAL_CONTEXT_KEY,
        Map({ ...buildMockLocalContext({ itemId }), apiHost: null }),
      );

      const response = FIXTURE_APP_DATA;
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
      const response = FIXTURE_APP_DATA;
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
      const response = FIXTURE_APP_DATA;
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

  describe('useFileContent', () => {
    // create another nock for external storage
    const server = 'http://aws';
    const routeFile = '/someurl';
    const response = S3_FILE_BLOB_RESPONSE;
    const responseFile = `${server}${routeFile}`;

    const id = 'some-id';
    const route = `/${buildDownloadFilesRoute(id)}`;
    const hook = () => hooks.useFileContent({ fileId: id });
    const key = buildFileContentKey(id);

    it('Receive file content', async () => {
      const endpoints = [
        { route, response: responseFile },
        { route: routeFile, response },
      ];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeTruthy();
    });

    it('Undefined id does not fetch', async () => {
      const endpoints = [{ route, response }];
      const { data, isFetched } = await mockHook({
        endpoints,
        hook: () => hooks.useFileContent(undefined),
        wrapper,
        enabled: false,
      });

      expect(data).toBeFalsy();
      expect(isFetched).toBeFalsy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });

    it('enabled=false does not fetch file', async () => {
      // build endpoint for each item
      const endpoints: Endpoint[] = [];
      const { data, isFetched } = await mockHook({
        hook: () => hooks.useFileContent({ fileId: id }, { enabled: false }),
        endpoints,
        wrapper,
        enabled: false,
      });

      expect(data).toBeFalsy();
      expect(isFetched).toBeFalsy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
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
        endpoints,
        wrapper,
      });

      expect(isError).toBeTruthy();
      expect(data).toBeFalsy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });
  });
});
