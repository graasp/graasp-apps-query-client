import { act } from '@testing-library/react-hooks';
import nock from 'nock';
import { v4 } from 'uuid';
import { List } from 'immutable';
import { FIXTURE_APP_DATA, FIXTURE_TOKEN, UNAUTHORIZED_RESPONSE } from '../../test/constants';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import { buildDeleteAppDataRoute } from '../api/routes';
import { buildAppDataKey, MUTATION_KEYS } from '../config/keys';
import { REQUEST_METHODS } from '../api/utils';
import { AppData } from '../types';
import { StatusCodes } from 'http-status-codes';

const mockedNotifier = jest.fn();
const { wrapper, queryClient, useMutation } = setUpTest({
  notifier: mockedNotifier,
});

const token = FIXTURE_TOKEN;

describe('Items Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe(MUTATION_KEYS.DELETE_APP_DATA, () => {
    const itemId = v4();
    const key = buildAppDataKey(itemId);
    const toDelete = FIXTURE_APP_DATA[0];
    const route = `/${buildDeleteAppDataRoute({ itemId, id: toDelete.id })}`;
    const mutation = () => useMutation(MUTATION_KEYS.DELETE_APP_DATA);

    it('Delete app data', async () => {
      queryClient.setQueryData(key, List([toDelete]));

      const response = toDelete;

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
        await mockedMutation.mutate({ token, itemId, id: toDelete.id });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      expect(queryClient.getQueryData<List<AppData>>(key)).toEqual(List());
    });

    it('Unauthorized', async () => {
      queryClient.setQueryData(key, List([toDelete]));

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
        await mockedMutation.mutate({ token, itemId, id: toDelete.id });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      expect(queryClient.getQueryData<List<AppData>>(key)).toEqual(List([toDelete]));
    });
  });
});
