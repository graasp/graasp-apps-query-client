import nock from 'nock';
import { v4 } from 'uuid';
import { StatusCodes } from 'http-status-codes';
import { List, Map } from 'immutable';
import { Endpoint, mockHook, setUpTest } from '../../test/utils';
import { buildDownloadAppSettingFileRoute, buildGetAppSettingsRoute } from '../api/routes';
import {
  AUTH_TOKEN_KEY,
  buildAppSettingFileContentKey,
  buildAppSettingsKey,
  LOCAL_CONTEXT_KEY,
} from '../config/keys';
import {
  UNAUTHORIZED_RESPONSE,
  buildMockLocalContext,
  FIXTURE_APP_SETTINGS,
  S3_FILE_BLOB_RESPONSE,
} from '../../test/constants';
import { MissingApiHostError } from '../config/utils';
import { MOCK_TOKEN } from '../config/constants';
import { AppSettingRecord } from '@graasp/sdk/frontend';
import { convertJs } from '@graasp/sdk';

const { hooks, wrapper, queryClient } = setUpTest();
const itemId = v4();

describe('App Settings Hooks', () => {
  beforeEach(() => {
    queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
    queryClient.setQueryData(LOCAL_CONTEXT_KEY, convertJs(buildMockLocalContext({ itemId })));
  });

  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useAppSettings', () => {
    const key = buildAppSettingsKey(itemId);
    const route = `/${buildGetAppSettingsRoute(itemId)}`;
    const hook = () => hooks.useAppSettings();

    it('Receive app settings', async () => {
      const response = FIXTURE_APP_SETTINGS;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as List<AppSettingRecord>).toJS()).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqualImmutable(convertJs(response));
    });
    it('Cannot fetch app settings if context does not exist', async () => {
      const response = FIXTURE_APP_SETTINGS;
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
      const response = FIXTURE_APP_SETTINGS;
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
      const response = FIXTURE_APP_SETTINGS;
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

  describe('useAppSettingFile', () => {
    // create another nock for external storage
    const server = 'http://aws';
    const routeFile = '/someurl';
    const response = S3_FILE_BLOB_RESPONSE;

    const responseFile = `${server}${routeFile}`;
    const id = 'some-id';
    const route = `/${buildDownloadAppSettingFileRoute(id)}`;
    const hook = () => hooks.useAppSettingFile({ appSettingId: id });
    const key = buildAppSettingFileContentKey(id);

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
        hook: () => hooks.useAppSettingFile(undefined),
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
        hook: () => hooks.useAppSettingFile({ appSettingId: id }, { enabled: false }),
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
