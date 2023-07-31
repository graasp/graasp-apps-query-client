import { List } from 'immutable';

import { AppDataRecord } from '@graasp/sdk/frontend';
import { convertJs } from '@graasp/sdk';

import { FIXTURE_APP_DATA, FIXTURE_CONTEXT, buildAppData } from '../../../test/constants';
import { getHandlerByChannel, mockWsHook, setUpWsTest } from '../../../test/wsUtils';
import { buildAppDataKey } from '../../config/keys';
import { configureWsAppHooks } from './app';
import { APP_DATA_TOPIC } from '../constants';
import { AppDataEvent } from '../types';

const { hooks, wrapper, queryClient, handlers } = setUpWsTest({
  configureWsHooks: configureWsAppHooks,
});

// jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Websockets App Hooks', () => {
  afterEach(() => {
    queryClient.clear();
  });

  describe('useAppDataUpdates', () => {
    const appDataArray = FIXTURE_APP_DATA;
    const appDataList: List<AppDataRecord> = convertJs(appDataArray);
    const itemId = FIXTURE_CONTEXT.id;
    const appDataKey = buildAppDataKey(itemId);
    const channel = { name: itemId, topic: APP_DATA_TOPIC };
    const hook = () => hooks.useAppDataUpdates(itemId);

    it('check that the tests are initialized', async () => {
      queryClient.setQueryData(appDataKey, appDataList);
      expect(typeof hook).toBe('function');
      mockWsHook({ hook, wrapper, enabled: true });
      expect(handlers.length).toBeGreaterThan(0);
      expect(queryClient).toBeDefined();
      expect(queryClient.getQueryData(appDataKey)).toEqualImmutable(appDataList);
    });

    it('Receives post app data', async () => {
      queryClient.setQueryData(appDataKey, appDataList);
      await mockWsHook({ hook, wrapper });

      const newAppData = buildAppData({ data: { message: 'This data was posted.' } });

      const appDataEvent: AppDataEvent = {
        kind: 'app-data',
        op: 'post',
        appData: newAppData,
      };

      const h = getHandlerByChannel(handlers, channel);
      h?.handler(appDataEvent);

      expect(
        queryClient
          .getQueryData<List<AppDataRecord>>(appDataKey)
          ?.find((a) => a.id === newAppData.id),
      ).toEqualImmutable(convertJs(newAppData));
    });

    it('Receives patch app data', async () => {
      queryClient.setQueryData(appDataKey, appDataList);
      await mockWsHook({ hook, wrapper });

      const newAppData = appDataArray[0];
      newAppData.data = { text: 'This data was already in the cache and was patched.' };

      const appDataEvent: AppDataEvent = {
        kind: 'app-data',
        op: 'patch',
        appData: newAppData,
      };

      getHandlerByChannel(handlers, channel)?.handler(appDataEvent);

      expect(
        queryClient
          .getQueryData<List<AppDataRecord>>(appDataKey)
          ?.find((a) => a.id === newAppData.id),
      ).toEqualImmutable(convertJs(newAppData));
    });

    it('Receives delete app data', async () => {
      queryClient.setQueryData(appDataKey, appDataList);
      await mockWsHook({ hook, wrapper });

      const newAppData = appDataArray[1]; // Doesn't work with same app data than other tests (index 0)

      expect(
        queryClient
          .getQueryData<List<AppDataRecord>>(appDataKey)
          ?.find((a) => a.id === newAppData.id),
      ).toEqualImmutable(newAppData);

      const appDataEvent: AppDataEvent = {
        kind: 'app-data',
        op: 'delete',
        appData: newAppData,
      };

      getHandlerByChannel(handlers, channel)?.handler(appDataEvent);

      expect(
        queryClient
          .getQueryData<List<AppDataRecord>>(appDataKey)
          ?.find((a) => a.id === newAppData.id),
      ).toBeUndefined();
    });
  });
});
