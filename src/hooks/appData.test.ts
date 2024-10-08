import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { v4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  FIXTURE_APP_DATA,
  RequestMethods,
  S3_FILE_BLOB_RESPONSE,
  UNAUTHORIZED_RESPONSE,
  buildMockLocalContext,
} from '../../test/constants.js';
import { Endpoint, mockHook, setUpTest } from '../../test/utils.js';
import { buildDownloadAppDataFileRoute, buildGetAppDataRoute } from '../api/routes.js';
import { MOCK_TOKEN } from '../config/constants.js';
import { AUTH_TOKEN_KEY, LOCAL_CONTEXT_KEY, appDataKeys } from '../config/keys.js';
import { MissingApiHostError } from '../config/utils.js';

const { hooks, wrapper, queryClient } = setUpTest();
const itemId = v4();

describe('App Data Hooks', () => {
  beforeEach(() => {
    queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
    queryClient.setQueryData(LOCAL_CONTEXT_KEY, buildMockLocalContext({ itemId }));
  });

  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useAppData', () => {
    const key = appDataKeys.single(itemId);
    const route = `/${buildGetAppDataRoute(itemId)}`;
    const hook = () => hooks.useAppData();

    it('Receive app data', async () => {
      const response = FIXTURE_APP_DATA;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(response);
    });
    it('Cannot fetch app data if context does not exist', async () => {
      queryClient.setQueryData(LOCAL_CONTEXT_KEY, {
        ...buildMockLocalContext({ itemId }),
        apiHost: null,
      });

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
    const key = appDataKeys.fileContent(id);

    it('Receive file content', async () => {
      const endpoints = [
        { route, response: responseFile },
        {
          route: routeFile,
          response,
        },
        // necessary for axios to know which methods are allowed
        { route: routeFile, response, method: RequestMethods.OPTIONS },
      ] satisfies Endpoint[];
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
