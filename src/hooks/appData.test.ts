import { StatusCodes } from 'http-status-codes';
import { List } from 'immutable';
import nock from 'nock';
import { v4 } from 'uuid';
import {
  buildMockLocalContext,
  FIXTURE_APP_DATA,
  S3_FILE_BLOB_RESPONSE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { Endpoint, mockHook, setUpTest } from '../../test/utils';
import { buildDownloadAppDataFileRoute, buildGetAppDataRoute } from '../api/routes';
import { MOCK_TOKEN } from '../config/constants';
import {
  AUTH_TOKEN_KEY,
  buildAppDataKey,
  buildFileContentKey,
  LOCAL_CONTEXT_KEY,
} from '../config/keys';
import { MissingApiHostError } from '../config/utils';
import { AppDataRecord } from '@graasp/sdk/frontend';
import { convertJs } from '@graasp/sdk';

const { hooks, wrapper, queryClient } = setUpTest();
const itemId = v4();

describe('App Data Hooks', () => {
  beforeEach(() => {
    queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
    queryClient.setQueryData(LOCAL_CONTEXT_KEY, convertJs(buildMockLocalContext({ itemId })));
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

      expect((data as List<AppDataRecord>).toJS()).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqualImmutable(convertJs(response));
    });
    it('Cannot fetch app data if context does not exist', async () => {
      queryClient.setQueryData(
        LOCAL_CONTEXT_KEY,
        convertJs({ ...buildMockLocalContext({ itemId }), apiHost: null }),
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

  describe('useAppDataFile', () => {
    // create another nock for external storage
    const server = 'http://aws';
    const routeFile = '/someurl';
    const response = S3_FILE_BLOB_RESPONSE;
    const responseFile = `${server}${routeFile}`;

    const id = 'some-id';
    const route = `/${buildDownloadAppDataFileRoute(id)}`;
    const hook = () => hooks.useAppDataFile({ fileId: id });
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
        hook: () => hooks.useAppDataFile(undefined),
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
        hook: () => hooks.useAppDataFile({ fileId: id }, { enabled: false }),
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
