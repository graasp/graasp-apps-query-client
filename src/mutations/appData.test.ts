import { act } from '@testing-library/react-hooks';
import nock from 'nock';
import { v4 } from 'uuid';
import { List } from 'immutable';
import {
  FIXTURE_APP_DATA,
  buildMockLocalContext,
  REQUEST_METHODS,
  UNAUTHORIZED_RESPONSE,
  buildAppData,
} from '../../test/constants';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import {
  buildDeleteAppDataRoute,
  buildPatchAppDataRoute,
  buildPostAppDataRoute,
} from '../api/routes';
import { AUTH_TOKEN_KEY, buildAppDataKey, LOCAL_CONTEXT_KEY, MUTATION_KEYS } from '../config/keys';
import { StatusCodes } from 'http-status-codes';
import { MOCK_TOKEN } from '../config/constants';
import { patchAppDataRoutine, postAppDataRoutine } from '../routines';
import { AppDataRecord } from '@graasp/sdk/frontend';
import { convertJs } from '@graasp/sdk';

const mockedNotifier = jest.fn();
const { wrapper, queryClient, useMutation } = setUpTest({
  notifier: mockedNotifier,
});

describe('Apps Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe(MUTATION_KEYS.POST_APP_DATA[0], () => {
    const itemId = v4();
    const key = buildAppDataKey(itemId);
    const toAdd = buildAppData();
    const initData = convertJs(FIXTURE_APP_DATA);
    const route = `/${buildPostAppDataRoute({ itemId })}`;
    const mutation = () => useMutation(MUTATION_KEYS.POST_APP_DATA);

    describe('Successful requests', () => {
      beforeEach(() => {
        // set necessary data
        queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, convertJs(buildMockLocalContext({ itemId })));
      });

      it('Create app data', async () => {
        queryClient.setQueryData(key, initData);

        const response = toAdd;

        const endpoints = [
          {
            response,
            method: REQUEST_METHODS.POST,
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
        expect(queryClient.getQueryData<List<AppDataRecord>>(key)).toEqualImmutable(
          initData.push(convertJs(toAdd)),
        );
      });
    });

    describe('Failed requests', () => {
      it('Unauthorized', async () => {
        // set necessary data
        queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, convertJs(buildMockLocalContext({ itemId })));

        queryClient.setQueryData(key, initData);

        const response = UNAUTHORIZED_RESPONSE;

        const endpoints = [
          {
            response,
            statusCode: StatusCodes.UNAUTHORIZED,
            method: REQUEST_METHODS.POST,
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
        expect(queryClient.getQueryData<List<AppDataRecord>>(key)).toEqualImmutable(initData);
      });

      it('Throw if itemId is undefined', async () => {
        // set necessary data
        queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
        queryClient.setQueryData(
          LOCAL_CONTEXT_KEY,
          convertJs({ ...buildMockLocalContext(), itemId: null }),
        );
        queryClient.setQueryData(key, initData);

        const endpoints = [
          {
            response: toAdd,
            method: REQUEST_METHODS.POST,
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
        expect(queryClient.getQueryData(key)).toEqualImmutable(initData);
        // since the itemid is not defined, we do not check data for its key
      });

      it('Throw if memberId is undefined', async () => {
        // set necessary data
        queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
        queryClient.setQueryData(
          LOCAL_CONTEXT_KEY,
          convertJs({ ...buildMockLocalContext({ itemId }), memberId: null }),
        );
        queryClient.setQueryData(key, initData);

        const endpoints = [
          {
            response: toAdd,
            method: REQUEST_METHODS.POST,
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
            type: postAppDataRoutine.FAILURE,
          }),
        );
        expect(queryClient.getQueryData(key)).toEqualImmutable(initData);
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      });

      it('Throw if token is undefined', async () => {
        // set necessary data
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, convertJs(buildMockLocalContext({ itemId })));
        queryClient.setQueryData(key, initData);

        const endpoints = [
          {
            response: toAdd,
            method: REQUEST_METHODS.POST,
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
            type: postAppDataRoutine.FAILURE,
          }),
        );
        expect(queryClient.getQueryData(key)).toEqualImmutable(initData);
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      });
    });
  });

  describe(MUTATION_KEYS.PATCH_APP_DATA[0], () => {
    const initData = convertJs(FIXTURE_APP_DATA);
    const itemId = v4();
    const appDataId = initData.first()?.id ?? v4();
    const key = buildAppDataKey(itemId);
    const toPatch = buildAppData({ id: appDataId, data: { new: 'data' } });
    const updatedData = convertJs([toPatch, ...initData.delete(0).toJS()]);
    const route = `/${buildPatchAppDataRoute({ id: toPatch.id, itemId })}`;
    const mutation = () => useMutation(MUTATION_KEYS.PATCH_APP_DATA);

    describe('Successful requests', () => {
      beforeEach(() => {
        // set necessary data
        queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, convertJs(buildMockLocalContext({ itemId })));
      });

      it('Patch app data', async () => {
        queryClient.setQueryData(key, initData);

        const response = toPatch;

        const endpoints = [
          {
            response,
            method: REQUEST_METHODS.PATCH,
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
        const result = queryClient.getQueryData<List<AppDataRecord>>(key);
        expect(result?.first()?.data?.toJS()).toMatchObject(toPatch.data);
        expect(result?.size).toBe(updatedData.size);
      });
    });

    describe('Failed requests', () => {
      it('Unauthorized', async () => {
        // set necessary data
        queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, convertJs(buildMockLocalContext({ itemId })));

        queryClient.setQueryData(key, initData);

        const response = UNAUTHORIZED_RESPONSE;

        const endpoints = [
          {
            response,
            statusCode: StatusCodes.UNAUTHORIZED,
            method: REQUEST_METHODS.PATCH,
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
        expect(queryClient.getQueryData<List<AppDataRecord>>(key)).toEqualImmutable(initData);
      });

      it('Throw if itemId is undefined', async () => {
        // set necessary data
        queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
        queryClient.setQueryData(
          LOCAL_CONTEXT_KEY,
          convertJs({ ...buildMockLocalContext(), itemId: null }),
        );
        queryClient.setQueryData(key, initData);

        const endpoints = [
          {
            response: toPatch,
            method: REQUEST_METHODS.PATCH,
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
        expect(queryClient.getQueryData(key)).toEqualImmutable(initData);
        // since the itemid is not defined, we do not check data for its key
      });

      it('Throw if memberId is undefined', async () => {
        // set necessary data
        queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
        queryClient.setQueryData(
          LOCAL_CONTEXT_KEY,
          convertJs({ ...buildMockLocalContext({ itemId }), memberId: null }),
        );
        queryClient.setQueryData(key, initData);

        const endpoints = [
          {
            response: toPatch,
            method: REQUEST_METHODS.PATCH,
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
        expect(queryClient.getQueryData(key)).toEqualImmutable(initData);
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      });

      it('Throw if token is undefined', async () => {
        // set necessary data
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, convertJs(buildMockLocalContext({ itemId })));
        queryClient.setQueryData(key, initData);

        const endpoints = [
          {
            response: toPatch,
            method: REQUEST_METHODS.PATCH,
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
        expect(queryClient.getQueryData(key)).toEqualImmutable(initData);
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      });
    });
  });

  describe(MUTATION_KEYS.DELETE_APP_DATA[0], () => {
    const itemId = v4();
    const key = buildAppDataKey(itemId);
    const toDelete = FIXTURE_APP_DATA[0];
    const initData = convertJs([toDelete, FIXTURE_APP_DATA[1]]);
    const route = `/${buildDeleteAppDataRoute({ itemId, id: toDelete.id })}`;
    const mutation = () => useMutation(MUTATION_KEYS.DELETE_APP_DATA);

    describe('Successful requests', () => {
      const response = toDelete;
      beforeEach(() => {
        // set necessary data
        queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, convertJs(buildMockLocalContext({ itemId })));
      });

      it('Delete app data', async () => {
        queryClient.setQueryData(key, initData);

        const endpoints = [
          {
            response,
            method: REQUEST_METHODS.DELETE,
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
        expect(queryClient.getQueryData<List<AppDataRecord>>(key)).toEqualImmutable(
          convertJs([FIXTURE_APP_DATA[1]]),
        );
      });
    });

    describe('Failed requests', () => {
      it('Unauthorized', async () => {
        // set necessary data
        queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, convertJs(buildMockLocalContext({ itemId })));

        queryClient.setQueryData(key, convertJs([toDelete]));

        const response = UNAUTHORIZED_RESPONSE;

        const endpoints = [
          {
            response,
            statusCode: StatusCodes.UNAUTHORIZED,
            method: REQUEST_METHODS.DELETE,
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
        expect(queryClient.getQueryData<List<AppDataRecord>>(key)).toEqualImmutable(
          convertJs([toDelete]),
        );
      });

      it('Throw if itemId is undefined', async () => {
        // set necessary data
        queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
        queryClient.setQueryData(
          LOCAL_CONTEXT_KEY,
          convertJs({ ...buildMockLocalContext(), itemId: null }),
        );

        const initData = convertJs([toDelete]);
        queryClient.setQueryData(key, initData);

        const endpoints = [
          {
            response: toDelete,
            method: REQUEST_METHODS.DELETE,
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

        expect(queryClient.getQueryData(key)).toEqualImmutable(initData);
        // since the itemid is not defined, we do not check data for its key
      });

      it('Throw if memberId is undefined', async () => {
        // set necessary data
        queryClient.setQueryData(AUTH_TOKEN_KEY, MOCK_TOKEN);
        queryClient.setQueryData(
          LOCAL_CONTEXT_KEY,
          convertJs({ ...buildMockLocalContext({ itemId }), memberId: null }),
        );

        const initData = convertJs([toDelete]);
        queryClient.setQueryData(key, initData);

        const endpoints = [
          {
            response: toDelete,
            method: REQUEST_METHODS.DELETE,
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

        expect(queryClient.getQueryData(key)).toEqualImmutable(initData);
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      });

      it('Throw if token is undefined', async () => {
        // set necessary data
        queryClient.setQueryData(LOCAL_CONTEXT_KEY, convertJs(buildMockLocalContext({ itemId })));

        const initData = convertJs([toDelete]);
        queryClient.setQueryData(key, initData);

        const endpoints = [
          {
            response: toDelete,
            method: REQUEST_METHODS.DELETE,
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

        expect(queryClient.getQueryData(key)).toEqualImmutable(initData);
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      });
    });
  });
});
