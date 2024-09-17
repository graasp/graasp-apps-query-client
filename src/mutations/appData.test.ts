import { AppData } from '@graasp/sdk';

import { act } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { v4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  FIXTURE_APP_DATA,
  RequestMethods,
  UNAUTHORIZED_RESPONSE,
  buildAppData,
  buildMockLocalContext,
} from '../../test/constants.js';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils.js';
import {
  buildDeleteAppDataRoute,
  buildPatchAppDataRoute,
  buildPostAppDataRoute,
} from '../api/routes.js';
import { MOCK_TOKEN } from '../config/constants.js';
import { AUTH_TOKEN_KEY, LOCAL_CONTEXT_KEY, appDataKeys } from '../config/keys.js';
import { patchAppDataRoutine, postAppDataRoutine } from '../routines/index.js';

const mockedNotifier = vi.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});

describe('Apps Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe('usePostAppData', () => {
    const itemId = v4();
    const key = appDataKeys.single(itemId);
    const toAdd = buildAppData();
    const initData = FIXTURE_APP_DATA;
    const route = `/${buildPostAppDataRoute({ itemId })}`;
    const mutation = mutations.usePostAppData;

    describe('Successful requests', () => {
      beforeEach(() => {
        // set necessary data
        queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, buildMockLocalContext({ itemId }));
      });

      it('Create app data', async () => {
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
          await mockedMutation.mutate({ data: toAdd.data, type: toAdd.type });
          await waitForMutation();
        });

        expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
        expect(queryClient.getQueryData(key)).toEqual([...initData, toAdd]);
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
          await mockedMutation.mutate({ data: toAdd.data, type: toAdd.type });
          await waitForMutation();
        });

        expect(mockedNotifier).toHaveBeenCalledWith(
          expect.objectContaining({
            type: postAppDataRoutine.FAILURE,
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
          await mockedMutation.mutate({ data: toAdd.data, type: toAdd.type });
          await waitForMutation();
        });

        expect(mockedNotifier).toHaveBeenCalledWith(
          expect.objectContaining({
            type: postAppDataRoutine.FAILURE,
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
          mockedMutation.mutate(toAdd);
          await waitForMutation();
        });

        expect(mockedNotifier).toHaveBeenCalledWith(
          expect.objectContaining({
            type: postAppDataRoutine.FAILURE,
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
          await mockedMutation.mutate(toAdd);
          await waitForMutation();
        });

        expect(mockedNotifier).toHaveBeenCalledWith(
          expect.objectContaining({
            type: postAppDataRoutine.FAILURE,
          }),
        );
        expect(queryClient.getQueryData(key)).toEqual(initData);
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      });
    });
  });

  describe('usePatchAppData', () => {
    const initData = FIXTURE_APP_DATA;
    const itemId = v4();
    const appDataId = initData[0]?.id ?? v4();
    const key = appDataKeys.single(itemId);
    const toPatch = buildAppData({ id: appDataId, data: { new: 'data' } });
    const updatedData = [toPatch, ...initData.slice(1)];
    const route = `/${buildPatchAppDataRoute({ id: toPatch.id, itemId })}`;
    const mutation = mutations.usePatchAppData;

    describe('Successful requests', () => {
      beforeEach(() => {
        // set necessary data
        queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, buildMockLocalContext({ itemId }));
      });

      it('Patch app data', async () => {
        queryClient.setQueryData(key, initData);

        const response = toPatch;

        const endpoints = [
          {
            response,
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

        expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
        // check data and length
        const result = queryClient.getQueryData<AppData[]>(key);
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
            type: patchAppDataRoutine.FAILURE,
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
            type: patchAppDataRoutine.FAILURE,
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
            type: patchAppDataRoutine.FAILURE,
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
            type: patchAppDataRoutine.FAILURE,
          }),
        );
        expect(queryClient.getQueryData(key)).toEqual(initData);
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      });
    });
  });

  describe('useDeleteAppData', () => {
    const itemId = v4();
    const key = appDataKeys.single(itemId);
    const toDelete = FIXTURE_APP_DATA[0];
    const route = `/${buildDeleteAppDataRoute({ itemId, id: toDelete.id })}`;
    const mutation = mutations.useDeleteAppData;

    describe('Successful requests', () => {
      const response = toDelete;
      beforeEach(() => {
        // set necessary data
        queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, buildMockLocalContext({ itemId }));
      });

      it('Delete app data', async () => {
        const initData = [toDelete, FIXTURE_APP_DATA[1]];
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
        expect(queryClient.getQueryData(key)).toEqual([FIXTURE_APP_DATA[1]]);
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
        // since the itemid is not defined, we do not check data for its key
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
