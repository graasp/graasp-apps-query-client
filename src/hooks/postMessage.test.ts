import { v4 } from 'uuid';
import { Record } from 'immutable';
import { mockHook, mockWindowForPostMessage, setUpTest } from '../../test/utils';
import { Context, LocalContext } from '../types';
import { AUTH_TOKEN_KEY, LOCAL_CONTEXT_KEY, POST_MESSAGE_KEYS } from '../config/keys';
import { API_HOST, buildMockLocalContext } from '../../test/constants';
import { DEFAULT_CONTEXT, DEFAULT_LANG, DEFAULT_PERMISSION, MOCK_TOKEN } from '../config/constants';
import {
  MissingAppIdError,
  MissingAppOriginError,
  MissingMessageChannelPortError,
} from '../config/errors';

describe('PostMessage Hooks', () => {
  describe('useGetLocalContext', () => {
    const key = LOCAL_CONTEXT_KEY;

    describe('Successful requests', () => {
      const { hooks, wrapper, queryClient } = setUpTest();
      const hook = () => hooks.useGetLocalContext();

      afterEach(() => {
        queryClient.clear();
      });

      it('Get default local context', async () => {
        const event = {
          ports: ['mock-port'],
          data: JSON.stringify({
            type: POST_MESSAGE_KEYS.GET_CONTEXT_SUCCESS,
            // the server does not give any data, the context should be built with default values
            payload: {},
          }),
        } as unknown as MessageEvent;
        mockWindowForPostMessage(event);

        const { data } = await mockHook({ hook, wrapper });
        const context = (data as Record<LocalContext>).toJS();
        expect(context).toEqual({
          apiHost: undefined,
          memberId: undefined,
          itemId: undefined,
          context: DEFAULT_CONTEXT,
          lang: DEFAULT_LANG,
          permission: DEFAULT_PERMISSION,
          settings: {},
          dev: false,
          offline: false,
          standalone: false,
        });

        // verify cache keys
        expect(queryClient.getQueryData(key)).toEqual(data);
      });

      it('Get local context given server response', async () => {
        const serverResponse = {
          apiHost: API_HOST,
          permission: 'write',
          lang: 'fr',
          itemId: v4(),
          memberId: v4(),
          settings: { some: 'value' },
          offline: true,
          dev: true,
          context: Context.PLAYER,
        };
        const event = {
          ports: ['mock-port'],
          data: JSON.stringify({
            type: POST_MESSAGE_KEYS.GET_CONTEXT_SUCCESS,
            payload: serverResponse,
          }),
        } as unknown as MessageEvent;
        mockWindowForPostMessage(event);

        const { data } = await mockHook({ hook, wrapper });

        expect((data as Record<LocalContext>).toJS()).toEqual({
          ...serverResponse,
          standalone: false,
        });

        // verify cache keys
        expect(queryClient.getQueryData(key)).toEqual(data);
      });
    });

    describe('Failed requests', () => {
      it('Gracefully fails on response error', async () => {
        const { hooks, wrapper, queryClient } = setUpTest({ GRAASP_APP_ID: v4() });
        const hook = () => hooks.useGetLocalContext();
        const event = {
          data: JSON.stringify({
            type: POST_MESSAGE_KEYS.GET_CONTEXT_FAILURE,
            payload: {},
          }),
        } as unknown as MessageEvent;
        mockWindowForPostMessage(event);

        const { isError } = await mockHook({ hook, wrapper });

        expect(isError).toBeTruthy();

        // verify cache keys
        expect(queryClient.getQueryData(key)).toBeFalsy();

        queryClient.clear();
      });

      it('Fails if app origin is undefined', async () => {
        const { hooks, wrapper, queryClient } = setUpTest({ GRAASP_APP_ID: v4() });
        const hook = () => hooks.useGetLocalContext();
        const event = {
          data: JSON.stringify({
            type: POST_MESSAGE_KEYS.GET_CONTEXT_FAILURE,
            payload: {},
          }),
        } as unknown as MessageEvent;
        mockWindowForPostMessage(event, null);

        const { isError, error } = await mockHook({ hook, wrapper });

        expect(isError).toBeTruthy();

        // verify cache keys
        expect(queryClient.getQueryData(key)).toBeFalsy();
        expect(error as MissingAppOriginError).toEqual(new MissingAppOriginError());
        queryClient.clear();
      });

      it('Fails if app id is undefined', async () => {
        const { hooks, wrapper, queryClient } = setUpTest({ GRAASP_APP_ID: null });
        const hook = () => hooks.useGetLocalContext();
        const event = {
          data: JSON.stringify({}),
        } as unknown as MessageEvent;
        mockWindowForPostMessage(event);

        const { isError, error } = await mockHook({ hook, wrapper });

        expect(isError).toBeTruthy();

        // verify cache keys
        expect(queryClient.getQueryData(key)).toBeFalsy();
        expect(error as MissingAppIdError).toEqual(new MissingAppIdError());

        queryClient.clear();
      });
    });
  });

  describe('useAuthToken', () => {
    const key = AUTH_TOKEN_KEY;

    describe('Successful requests', () => {
      const { hooks, wrapper, queryClient } = setUpTest();
      const hook = () => hooks.useAuthToken();

      // mock port: necessary to test auth token
      const port = {
        postMessage: () => {
          /*do nothing*/
        },
        onmessage: (_event: MessageEvent) => {
          /*do nothing*/
        },
      };

      it('Get auth token', async () => {
        // run context first to set port
        const event = {
          ports: [port],
          data: JSON.stringify({
            type: POST_MESSAGE_KEYS.GET_CONTEXT_SUCCESS,
            payload: buildMockLocalContext(),
          }),
        } as unknown as MessageEvent;
        mockWindowForPostMessage(event);
        await mockHook({ hook: () => hooks.useGetLocalContext(), wrapper });

        const event1 = {
          data: JSON.stringify({
            type: POST_MESSAGE_KEYS.GET_AUTH_TOKEN_SUCCESS,
            payload: { token: MOCK_TOKEN },
          }),
        } as unknown as MessageEvent;
        port.postMessage = () => {
          port.onmessage(event1);
        };

        const { data } = await mockHook({ hook, wrapper });
        expect(data).toEqual(MOCK_TOKEN);

        // verify cache keys
        expect(queryClient.getQueryData(key)).toEqual(data);
      });
    });

    describe('Failed requests', () => {
      it('Fails if port2 is undefined', async () => {
        const { hooks, wrapper, queryClient } = setUpTest({ GRAASP_APP_ID: v4() });
        const hook = () => hooks.useAuthToken();

        const event = {
          data: JSON.stringify({
            type: POST_MESSAGE_KEYS.GET_AUTH_TOKEN_SUCCESS,
            payload: { token: MOCK_TOKEN },
          }),
        } as unknown as MessageEvent;
        mockWindowForPostMessage(event);

        const { error, isError } = await mockHook({ hook, wrapper });
        expect(isError).toBeTruthy();

        // verify cache keys
        expect(error as MissingMessageChannelPortError).toEqual(
          new MissingMessageChannelPortError(),
        );

        queryClient.clear();
      });
    });
  });
});
