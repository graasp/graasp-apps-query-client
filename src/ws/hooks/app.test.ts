import { List } from 'immutable';

import { AppActionRecord, AppDataRecord, AppSettingRecord } from '@graasp/sdk/frontend';
import { convertJs } from '@graasp/sdk';

import {
  FIXTURE_APP_ACTIONS,
  FIXTURE_APP_DATA,
  FIXTURE_APP_SETTINGS,
  FIXTURE_CONTEXT,
  buildAppAction,
  buildAppData,
  buildAppSetting,
} from '../../../test/constants';
import { getHandlerByChannel, mockWsHook, setUpWsTest } from '../../../test/wsUtils';
import { buildAppActionsKey, buildAppDataKey, buildAppSettingsKey } from '../../config/keys';
import { configureWsAppHooks } from './app';
import { APP_ACTIONS_TOPIC, APP_DATA_TOPIC, APP_SETTINGS_TOPIC } from '../constants';
import { AppActionEvent, AppDataEvent, AppSettingEvent } from '../types';

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
      ).toEqualImmutable(convertJs(newAppData));

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

  describe('useAppActionsUpdates', () => {
    const appActionsArray = FIXTURE_APP_ACTIONS;
    const appActionsList: List<AppActionRecord> = convertJs(appActionsArray);
    const itemId = FIXTURE_CONTEXT.id;
    const appActionsKey = buildAppActionsKey(itemId);
    const channel = { name: itemId, topic: APP_ACTIONS_TOPIC };
    const hook = () => hooks.useAppActionsUpdates(itemId);

    it('check that the tests are initialized', async () => {
      queryClient.setQueryData(appActionsKey, appActionsList);
      expect(typeof hook).toBe('function');
      mockWsHook({ hook, wrapper, enabled: true });
      expect(handlers.length).toBeGreaterThan(0);
      expect(queryClient).toBeDefined();
      expect(queryClient.getQueryData(appActionsKey)).toEqualImmutable(appActionsList);
    });

    it('Receives post app action', async () => {
      queryClient.setQueryData(appActionsKey, appActionsList);
      await mockWsHook({ hook, wrapper });

      const newAppAction = buildAppAction({ data: { text: 'new action' } });

      const appActionEvent: AppActionEvent = {
        kind: 'app-actions',
        op: 'post',
        appAction: newAppAction,
      };

      const h = getHandlerByChannel(handlers, channel);
      h?.handler(appActionEvent);

      expect(
        queryClient
          .getQueryData<List<AppActionRecord>>(appActionsKey)
          ?.find((a) => a.id === newAppAction.id),
      ).toEqualImmutable(convertJs(newAppAction));
    });
  });

  describe('useAppSettingsUpdates', () => {
    const appSettingsArray = FIXTURE_APP_SETTINGS;
    const appSettingsList: List<AppSettingRecord> = convertJs(appSettingsArray);
    const itemId = FIXTURE_CONTEXT.id;
    const appSettingsKey = buildAppSettingsKey(itemId);
    const channel = { name: itemId, topic: APP_SETTINGS_TOPIC };
    const hook = () => hooks.useAppSettingsUpdates(itemId);

    it('check that the tests are initialized', async () => {
      queryClient.setQueryData(appSettingsKey, appSettingsList);
      expect(typeof hook).toBe('function');
      mockWsHook({ hook, wrapper, enabled: true });
      expect(handlers.length).toBeGreaterThan(0);
      expect(queryClient).toBeDefined();
      expect(queryClient.getQueryData(appSettingsKey)).toEqualImmutable(appSettingsList);
    });

    it('Receives post app setting', async () => {
      queryClient.setQueryData(appSettingsKey, appSettingsList);
      await mockWsHook({ hook, wrapper });

      const newAppSetting = buildAppSetting({ data: { togggle: true, parameter1: 'fixed' } });
      // const newAppDataRecord: AppDataRecord = convertJs(newAppData);

      const appDataEvent: AppSettingEvent = {
        kind: 'app-settings',
        op: 'post',
        appSetting: newAppSetting,
      };

      const h = getHandlerByChannel(handlers, channel);
      h?.handler(appDataEvent);

      expect(
        queryClient
          .getQueryData<List<AppDataRecord>>(appSettingsKey)
          ?.find((a) => a.id === newAppSetting.id),
      ).toEqualImmutable(convertJs(newAppSetting));
    });

    it('Receives patch app setting', async () => {
      queryClient.setQueryData(appSettingsKey, appSettingsList);
      await mockWsHook({ hook, wrapper });

      const newAppSetting = appSettingsArray[0];
      newAppSetting.data = { togggle: true, parameter1: 'floating' };

      // const newAppDataRecord: AppDataRecord = convertJs(newAppData);

      const appDataEvent: AppSettingEvent = {
        kind: 'app-settings',
        op: 'patch',
        appSetting: newAppSetting,
      };

      getHandlerByChannel(handlers, channel)?.handler(appDataEvent);

      expect(
        queryClient
          .getQueryData<List<AppDataRecord>>(appSettingsKey)
          ?.find((a) => a.id === newAppSetting.id),
      ).toEqualImmutable(convertJs(newAppSetting));
    });

    it('Receives delete app setting', async () => {
      queryClient.setQueryData(appSettingsKey, appSettingsList);
      await mockWsHook({ hook, wrapper });

      const newAppSetting = appSettingsArray[1]; // Doesn't work with same app data than other tests (index 0)

      expect(
        queryClient
          .getQueryData<List<AppDataRecord>>(appSettingsKey)
          ?.find((a) => a.id === newAppSetting.id),
      ).toEqualImmutable(convertJs(newAppSetting));

      const appDataEvent: AppSettingEvent = {
        kind: 'app-settings',
        op: 'delete',
        appSetting: newAppSetting,
      };

      getHandlerByChannel(handlers, channel)?.handler(appDataEvent);

      expect(
        queryClient
          .getQueryData<List<AppDataRecord>>(appSettingsKey)
          ?.find((a) => a.id === newAppSetting.id),
      ).toBeUndefined();
    });
  });
});