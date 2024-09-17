import { AppAction, AppData, AppSetting } from '@graasp/sdk';

import { afterEach, describe, expect, it } from 'vitest';

import {
  FIXTURE_APP_ACTIONS,
  FIXTURE_APP_DATA,
  FIXTURE_APP_SETTINGS,
  FIXTURE_CONTEXT,
  buildAppAction,
  buildAppData,
  buildAppSetting,
} from '../../../test/constants.js';
import { getHandlerByChannel, mockWsHook, setUpWsTest } from '../../../test/wsUtils.js';
import { APP_ACTIONS_TOPIC, APP_DATA_TOPIC, APP_SETTINGS_TOPIC } from '../../config/constants.js';
import { appActionKeys, appDataKeys, appSettingKeys } from '../../config/keys.js';
import {
  AppActionEvent,
  AppDataEvent,
  AppEventKinds,
  AppOperations,
  AppSettingEvent,
} from '../types.js';
import {
  configureWsAppActionsHooks,
  configureWsAppDataHooks,
  configureWsAppSettingHooks,
} from './app.js';

const { hooks, wrapper, queryClient, handlers } = setUpWsTest({
  configureWsAppActionsHooks,
  configureWsAppDataHooks,
  configureWsAppSettingHooks,
});

describe('Websockets App Hooks', () => {
  afterEach(() => {
    queryClient.clear();
  });

  describe('useAppDataUpdates', () => {
    const appDataArray = FIXTURE_APP_DATA;
    const itemId = FIXTURE_CONTEXT.id;
    const appDataKey = appDataKeys.single(itemId);
    const channel = { name: itemId, topic: APP_DATA_TOPIC };
    const hook = () => hooks.useAppDataUpdates(itemId);

    it('check that the tests are initialized', async () => {
      queryClient.setQueryData(appDataKey, appDataArray);
      expect(typeof hook).toBe('function');
      mockWsHook({ hook, wrapper, enabled: true });
      expect(handlers.length).toBeGreaterThan(0);
      expect(queryClient).toBeDefined();
      expect(queryClient.getQueryData(appDataKey)).toEqual(appDataArray);
    });

    it('Receives post app data', async () => {
      queryClient.setQueryData(appDataKey, appDataArray);
      await mockWsHook({ hook, wrapper });

      const newAppData = buildAppData({ data: { message: 'This data was posted.' } });

      const appDataEvent: AppDataEvent = {
        kind: AppEventKinds.AppData,
        op: AppOperations.POST,
        appData: newAppData,
      };

      const h = getHandlerByChannel(handlers, channel);
      h?.handler(appDataEvent);

      expect(
        queryClient.getQueryData<AppData[]>(appDataKey)?.find((a) => a.id === newAppData.id),
      ).toEqual(newAppData);
    });

    it('Receives patch app data', async () => {
      queryClient.setQueryData(appDataKey, appDataArray);
      await mockWsHook({ hook, wrapper });

      const newAppData = appDataArray[0];
      newAppData.data = { text: 'This data was already in the cache and was patched.' };

      const appDataEvent: AppDataEvent = {
        kind: AppEventKinds.AppData,
        op: AppOperations.PATCH,
        appData: newAppData,
      };

      getHandlerByChannel(handlers, channel)?.handler(appDataEvent);
      expect(
        queryClient.getQueryData<AppData[]>(appDataKey)?.filter((a) => a.id === newAppData.id)
          .length,
      ).toEqual(1);
      expect(
        queryClient.getQueryData<AppData[]>(appDataKey)?.find((a) => a.id === newAppData.id),
      ).toEqual(newAppData);
    });

    it('Receives delete app data', async () => {
      queryClient.setQueryData(appDataKey, appDataArray);
      await mockWsHook({ hook, wrapper });

      const newAppData = appDataArray[1]; // Doesn't work with same app data than other tests (index 0)

      expect(
        queryClient.getQueryData<AppData[]>(appDataKey)?.find((a) => a.id === newAppData.id),
      ).toEqual(newAppData);

      const appDataEvent: AppDataEvent = {
        kind: AppEventKinds.AppData,
        op: AppOperations.DELETE,
        appData: newAppData,
      };

      getHandlerByChannel(handlers, channel)?.handler(appDataEvent);

      expect(
        queryClient.getQueryData<AppData[]>(appDataKey)?.find((a) => a.id === newAppData.id),
      ).toBeUndefined();
    });

    it('Receives delete app data, while having a single app data remaining', async () => {
      const lastAppData = appDataArray[1];
      const singleAppDataList = [lastAppData];
      queryClient.setQueryData(appDataKey, singleAppDataList);
      expect(singleAppDataList.length).toEqual(1);
      await mockWsHook({ hook, wrapper });

      expect(
        queryClient.getQueryData<AppData[]>(appDataKey)?.find((a) => a.id === lastAppData.id),
      ).toEqual(lastAppData);

      const appDataEvent: AppDataEvent = {
        kind: AppEventKinds.AppData,
        op: AppOperations.DELETE,
        appData: lastAppData,
      };

      getHandlerByChannel(handlers, channel)?.handler(appDataEvent);

      const queryData = queryClient.getQueryData<AppData[]>(appDataKey);
      expect(queryData?.length).toEqual(0);
      expect(queryData?.find((a) => a.id === lastAppData.id)).toBeUndefined();
    });
  });

  describe('useAppActionsUpdates', () => {
    const appActionsArray = FIXTURE_APP_ACTIONS;
    const itemId = FIXTURE_CONTEXT.id;
    const appActionsKey = appActionKeys.single(itemId);
    const channel = { name: itemId, topic: APP_ACTIONS_TOPIC };
    const hook = () => hooks.useAppActionsUpdates(itemId);

    it('check that the tests are initialized', async () => {
      queryClient.setQueryData(appActionsKey, appActionsArray);
      expect(typeof hook).toBe('function');
      mockWsHook({ hook, wrapper, enabled: true });
      expect(handlers.length).toBeGreaterThan(0);
      expect(queryClient).toBeDefined();
      expect(queryClient.getQueryData(appActionsKey)).toEqual(appActionsArray);
    });

    it('Receives post app action', async () => {
      queryClient.setQueryData(appActionsKey, appActionsArray);
      await mockWsHook({ hook, wrapper });

      const newAppAction = buildAppAction({ data: { text: 'new action' } });

      const appActionEvent: AppActionEvent = {
        kind: AppEventKinds.AppActions,
        op: AppOperations.POST,
        appAction: newAppAction,
      };

      const h = getHandlerByChannel(handlers, channel);
      h?.handler(appActionEvent);

      expect(
        queryClient.getQueryData<AppAction[]>(appActionsKey)?.find((a) => a.id === newAppAction.id),
      ).toEqual(newAppAction);
    });
  });

  describe('useAppSettingsUpdates', () => {
    const appSettingsArray = FIXTURE_APP_SETTINGS;
    const itemId = FIXTURE_CONTEXT.id;
    const appSettingsKey = appSettingKeys.single(itemId);
    const channel = { name: itemId, topic: APP_SETTINGS_TOPIC };
    const hook = () => hooks.useAppSettingsUpdates(itemId);

    it('check that the tests are initialized', async () => {
      queryClient.setQueryData(appSettingsKey, appSettingsArray);
      expect(typeof hook).toBe('function');
      mockWsHook({ hook, wrapper, enabled: true });
      expect(handlers.length).toBeGreaterThan(0);
      expect(queryClient).toBeDefined();
      expect(queryClient.getQueryData(appSettingsKey)).toEqual(appSettingsArray);
    });

    it('Receives post app setting', async () => {
      queryClient.setQueryData(appSettingsKey, appSettingsArray);
      await mockWsHook({ hook, wrapper });

      const newAppSetting = buildAppSetting({ data: { togggle: true, parameter1: 'fixed' } });

      const appDataEvent: AppSettingEvent = {
        kind: AppEventKinds.AppSettings,
        op: AppOperations.POST,
        appSetting: newAppSetting,
      };

      const h = getHandlerByChannel(handlers, channel);
      h?.handler(appDataEvent);
      expect(
        queryClient
          .getQueryData<AppSetting[]>(appSettingsKey)
          ?.find((a) => a.id === newAppSetting.id),
      ).toEqual(newAppSetting);
    });

    it('Receives patch app setting', async () => {
      queryClient.setQueryData(appSettingsKey, appSettingsArray);
      await mockWsHook({ hook, wrapper });

      const newAppSetting = appSettingsArray[0];
      newAppSetting.data = { togggle: true, parameter1: 'floating' };

      const appDataEvent: AppSettingEvent = {
        kind: AppEventKinds.AppSettings,
        op: AppOperations.PATCH,
        appSetting: newAppSetting,
      };

      getHandlerByChannel(handlers, channel)?.handler(appDataEvent);

      // The app setting should be unique.
      expect(
        queryClient
          .getQueryData<AppSetting[]>(appSettingsKey)
          ?.filter((a) => a.id === newAppSetting.id).length,
      ).toEqual(1);
      expect(
        queryClient
          .getQueryData<AppSetting[]>(appSettingsKey)
          ?.find((a) => a.id === newAppSetting.id),
      ).toEqual(newAppSetting);
    });

    it('Receives delete app setting', async () => {
      queryClient.setQueryData(appSettingsKey, appSettingsArray);
      await mockWsHook({ hook, wrapper });

      const newAppSetting = appSettingsArray[1]; // Doesn't work with same app data than other tests (index 0)

      expect(
        queryClient.getQueryData<AppData[]>(appSettingsKey)?.find((a) => a.id === newAppSetting.id),
      ).toEqual(newAppSetting);

      const appDataEvent: AppSettingEvent = {
        kind: AppEventKinds.AppSettings,
        op: AppOperations.DELETE,
        appSetting: newAppSetting,
      };

      getHandlerByChannel(handlers, channel)?.handler(appDataEvent);

      expect(
        queryClient
          .getQueryData<AppSetting[]>(appSettingsKey)
          ?.find((a) => a.id === newAppSetting.id),
      ).toBeUndefined();
    });
  });
});
