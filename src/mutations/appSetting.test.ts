import { AppSetting } from '@graasp/sdk';

import { act } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { v4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  FIXTURE_APP_SETTINGS,
  RequestMethods,
  UNAUTHORIZED_RESPONSE,
  buildAppSetting,
  buildMockLocalContext,
} from '../../test/constants.js';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils.js';
import {
  buildDeleteAppSettingRoute,
  buildPatchAppSettingRoute,
  buildPostAppSettingRoute,
} from '../api/routes.js';
import { MOCK_TOKEN } from '../config/constants.js';
import { AUTH_TOKEN_KEY, LOCAL_CONTEXT_KEY, appSettingKeys } from '../config/keys.js';
import { patchAppSettingRoutine, postAppSettingRoutine } from '../routines/index.js';

const mockedNotifier = vi.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});

describe('App Settings Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe('usePostAppSetting', () => {
    const itemId = v4();
    const key = appSettingKeys.single(itemId);
    const toAdd = buildAppSetting();
    const initData = FIXTURE_APP_SETTINGS;
    const route = `/${buildPostAppSettingRoute({ itemId })}`;
    const mutation = mutations.usePostAppSetting;

    describe('Successful requests', () => {
      beforeEach(() => {
        // set necessary data
        queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, buildMockLocalContext({ itemId }));
      });

      it('Create app setting', async () => {
        queryClient.setQueryData(key, initData);

        const response = toAdd;

        const endpoints = [
          {
            response,
            method: RequestMethods.POST,
            route,
          },
        ];

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ data: toAdd.data, name: toAdd.name });
          await waitForMutation();
        });

        expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      });
    });

    describe('Failed requests', () => {
      it('Unauthorized', async () => {
        // set necessary data
        queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, buildMockLocalContext({ itemId }));

        queryClient.setQueryData(key, initData);

        const response = UNAUTHORIZED_RESPONSE;

        const endpoints = [
          {
            response,
            statusCode: StatusCodes.UNAUTHORIZED,
            method: RequestMethods.POST,
            route,
          },
        ];

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ data: toAdd.data, name: toAdd.name });
          await waitForMutation();
        });

        expect(mockedNotifier).toHaveBeenCalledWith(
          expect.objectContaining({
            type: postAppSettingRoutine.FAILURE,
          }),
        );
        expect(queryClient.getQueryData(key)).toEqual(initData);
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      });

      it('Throw if itemId is undefined', async () => {
        // set necessary data
        queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, { ...buildMockLocalContext(), itemId: null });
        queryClient.setQueryData(key, initData);

        const endpoints = [
          {
            response: toAdd,
            method: RequestMethods.POST,
            route,
          },
        ];

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ data: toAdd.data, name: toAdd.name });
          await waitForMutation();
        });

        expect(mockedNotifier).toHaveBeenCalledWith(
          expect.objectContaining({
            type: postAppSettingRoutine.FAILURE,
          }),
        );
        expect(queryClient.getQueryData(key)).toEqual(initData);
        // since the itemid is not defined, we do not check data for its key
      });

      it('Throw if accountId is undefined', async () => {
        // set necessary data
        queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, {
          ...buildMockLocalContext({ itemId }),
          accountId: null,
        });
        queryClient.setQueryData(key, initData);

        const endpoints = [
          {
            response: toAdd,
            method: RequestMethods.POST,
            route,
          },
        ];

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ id: toAdd.id });
          await waitForMutation();
        });

        expect(mockedNotifier).toHaveBeenCalledWith(
          expect.objectContaining({
            type: postAppSettingRoutine.FAILURE,
          }),
        );
        expect(queryClient.getQueryData(key)).toEqual(initData);
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      });

      it('Throw if token is undefined', async () => {
        // set necessary data
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, buildMockLocalContext({ itemId }));
        queryClient.setQueryData(key, initData);

        const endpoints = [
          {
            response: toAdd,
            method: RequestMethods.POST,
            route,
          },
        ];

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ id: toAdd.id });
          await waitForMutation();
        });

        expect(mockedNotifier).toHaveBeenCalledWith(
          expect.objectContaining({
            type: postAppSettingRoutine.FAILURE,
          }),
        );
        expect(queryClient.getQueryData(key)).toEqual(initData);
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      });
    });
  });

  describe('usePatchAppSetting', () => {
    const initData = FIXTURE_APP_SETTINGS;
    const itemId = v4();
    const appDataId = initData[0]?.id ?? v4();
    const key = appSettingKeys.single(itemId);
    const toPatch = buildAppSetting({ id: appDataId, data: { new: 'data' } });
    const updatedData = [toPatch, ...initData.slice(1)];
    const route = `/${buildPatchAppSettingRoute({ id: toPatch.id, itemId })}`;
    const mutation = mutations.usePatchAppSetting;

    describe('Successful requests', () => {
      beforeEach(() => {
        // set necessary data
        queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, buildMockLocalContext({ itemId }));
      });

      it('Patch app setting', async () => {
        queryClient.setQueryData(key, initData);

        const endpoints = [
          {
            response: toPatch,
            method: RequestMethods.PATCH,
            route,
          },
        ];

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ ...toPatch, id: appDataId });
          await waitForMutation();
        });

        expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
        const result = queryClient.getQueryData<AppSetting[]>(key);
        // check data and length
        expect(result?.[0]?.data).toMatchObject(toPatch.data);
        expect(result).toHaveLength(updatedData.length);
      });
    });

    describe('Failed requests', () => {
      it('Unauthorized', async () => {
        // set necessary data
        queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, buildMockLocalContext({ itemId }));

        queryClient.setQueryData(key, initData);

        const response = UNAUTHORIZED_RESPONSE;

        const endpoints = [
          {
            response,
            statusCode: StatusCodes.UNAUTHORIZED,
            method: RequestMethods.PATCH,
            route,
          },
        ];

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ data: toPatch.data, id: appDataId });
          await waitForMutation();
        });

        expect(mockedNotifier).toHaveBeenCalledWith(
          expect.objectContaining({
            type: patchAppSettingRoutine.FAILURE,
          }),
        );
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
        expect(queryClient.getQueryData(key)).toEqual(initData);
      });

      it('Throw if itemId is undefined', async () => {
        // set necessary data
        queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, { ...buildMockLocalContext(), itemId: null });
        queryClient.setQueryData(key, initData);

        const endpoints = [
          {
            response: toPatch,
            method: RequestMethods.PATCH,
            route,
          },
        ];

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ data: toPatch.data, id: appDataId });
          await waitForMutation();
        });

        expect(mockedNotifier).toHaveBeenCalledWith(
          expect.objectContaining({
            type: patchAppSettingRoutine.FAILURE,
          }),
        );
        expect(queryClient.getQueryData(key)).toEqual(initData);
        // since the itemId is not defined, we do not check data for its key
      });

      it('Throw if accountId is undefined', async () => {
        // set necessary data
        queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, {
          ...buildMockLocalContext({ itemId }),
          accountId: null,
        });
        queryClient.setQueryData(key, initData);

        const endpoints = [
          {
            response: toPatch,
            method: RequestMethods.PATCH,
            route,
          },
        ];

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ data: toPatch.data, id: appDataId });
          await waitForMutation();
        });

        expect(mockedNotifier).toHaveBeenCalledWith(
          expect.objectContaining({
            type: patchAppSettingRoutine.FAILURE,
          }),
        );
        expect(queryClient.getQueryData(key)).toEqual(initData);
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      });

      it('Throw if token is undefined', async () => {
        // set necessary data
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, buildMockLocalContext({ itemId }));
        queryClient.setQueryData(key, initData);

        const endpoints = [
          {
            response: toPatch,
            method: RequestMethods.PATCH,
            route,
          },
        ];

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ data: toPatch.data, id: appDataId });
          await waitForMutation();
        });

        expect(mockedNotifier).toHaveBeenCalledWith(
          expect.objectContaining({
            type: patchAppSettingRoutine.FAILURE,
          }),
        );
        expect(queryClient.getQueryData(key)).toEqual(initData);
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      });
    });
  });

  describe('useDeleteAppSetting', () => {
    const itemId = v4();
    const key = appSettingKeys.single(itemId);
    const toDelete = FIXTURE_APP_SETTINGS[0];
    const route = `/${buildDeleteAppSettingRoute({ itemId, id: toDelete.id })}`;
    const mutation = mutations.useDeleteAppSetting;

    describe('Successful requests', () => {
      const response = toDelete;
      beforeEach(() => {
        // set necessary data
        queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, buildMockLocalContext({ itemId }));
      });

      it('Delete app data', async () => {
        const initData = [toDelete, FIXTURE_APP_SETTINGS[1]];
        queryClient.setQueryData(key, initData);

        const endpoints = [
          {
            response,
            method: RequestMethods.DELETE,
            route,
          },
        ];

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ id: toDelete.id });
          await waitForMutation();
        });

        expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
        expect(queryClient.getQueryData(key)).toEqual([FIXTURE_APP_SETTINGS[1]]);
      });
    });

    describe('Failed requests', () => {
      it('Unauthorized', async () => {
        // set necessary data
        queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, buildMockLocalContext({ itemId }));

        queryClient.setQueryData(key, [toDelete]);

        const response = UNAUTHORIZED_RESPONSE;

        const endpoints = [
          {
            response,
            statusCode: StatusCodes.UNAUTHORIZED,
            method: RequestMethods.DELETE,
            route,
          },
        ];

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ id: toDelete.id });
          await waitForMutation();
        });

        expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
        expect(queryClient.getQueryData(key)).toEqual([toDelete]);
      });

      it('Throw if itemId is undefined', async () => {
        // set necessary data
        queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, { ...buildMockLocalContext(), itemId: null });

        const initData = [toDelete];
        queryClient.setQueryData(key, initData);

        const endpoints = [
          {
            response: toDelete,
            method: RequestMethods.DELETE,
            route,
          },
        ];

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ id: toDelete.id });
          await waitForMutation();
        });

        expect(queryClient.getQueryData(key)).toEqual(initData);
        // since the itemId is not defined, we do not check data for its key
      });

      it('Throw if accountId is undefined', async () => {
        // set necessary data
        queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, {
          ...buildMockLocalContext({ itemId }),
          accountId: null,
        });

        const initData = [toDelete];
        queryClient.setQueryData(key, initData);

        const endpoints = [
          {
            response: toDelete,
            method: RequestMethods.DELETE,
            route,
          },
        ];

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ id: toDelete.id });
          await waitForMutation();
        });

        expect(queryClient.getQueryData(key)).toEqual(initData);
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      });

      it('Throw if token is undefined', async () => {
        // set necessary data
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, buildMockLocalContext({ itemId }));

        const initData = [toDelete];
        queryClient.setQueryData(key, initData);

        const endpoints = [
          {
            response: toDelete,
            method: RequestMethods.DELETE,
            route,
          },
        ];

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ id: toDelete.id });
          await waitForMutation();
        });

        expect(queryClient.getQueryData(key)).toEqual(initData);
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeFalsy();
      });
    });
  });
});
