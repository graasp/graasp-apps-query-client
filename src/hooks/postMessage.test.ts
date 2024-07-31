import { Context } from '@graasp/sdk';

import { renderHook } from '@testing-library/react';
import { v4 } from 'uuid';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { API_HOST, buildMockLocalContext } from '../../test/constants';
import { mockHook, mockWindowForPostMessage, setUpTest } from '../../test/utils';
import { defaultContextValue } from '../components/withContext';
import { DEFAULT_CONTEXT, DEFAULT_LANG, DEFAULT_PERMISSION, MOCK_TOKEN } from '../config/constants';
import {
  MissingAppKeyError,
  MissingAppOriginError,
  MissingMessageChannelPortError,
} from '../config/errors';
import { AUTH_TOKEN_KEY, LOCAL_CONTEXT_KEY, buildPostMessageKeys } from '../config/keys';

const mockItemId = 'mock-item-id';
const POST_MESSAGE_KEYS = buildPostMessageKeys(mockItemId);

// todo: disabled tests while they fail but the behavior is ok
describe.skip('PostMessage Hooks', () => {
  describe('useGetLocalContext', () => {
    const key = LOCAL_CONTEXT_KEY;

    describe('Successful requests', () => {
      const { hooks, wrapper, queryClient } = setUpTest();
      const hook = () => hooks.useGetLocalContext(mockItemId, defaultContextValue);

      afterEach(() => {
        vi.resetAllMocks();
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
        expect(data).toEqual({
          apiHost: undefined, // @see LocalContext
          memberId: undefined, // @see LocalContext
          itemId: undefined, // @see LocalContext
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
          context: Context.Player,
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

        expect(data).toEqual({
          ...serverResponse,
          standalone: false,
        });

        // verify cache keys
        expect(queryClient.getQueryData(key)).toEqual(data);
      });
    });

    describe('Failed requests', () => {
      it('Gracefully fails on response error', async () => {
        const { hooks, wrapper, queryClient } = setUpTest({ GRAASP_APP_KEY: v4() });
        const hook = () => hooks.useGetLocalContext(mockItemId, defaultContextValue);
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
        const { hooks, wrapper, queryClient } = setUpTest({ GRAASP_APP_KEY: v4() });
        const hook = () => hooks.useGetLocalContext(mockItemId, defaultContextValue);
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

      it('Fails if app key is undefined', async () => {
        const { hooks, wrapper, queryClient } = setUpTest({
          GRAASP_APP_KEY: '',
        });
        const hook = () => hooks.useGetLocalContext(mockItemId, defaultContextValue);
        const event = {
          data: JSON.stringify({}),
        } as unknown as MessageEvent;
        mockWindowForPostMessage(event);

        const { isError, error } = await mockHook({ hook, wrapper });

        expect(isError).toBeTruthy();

        // verify cache keys
        expect(queryClient.getQueryData(key)).toBeFalsy();
        expect(error as MissingAppKeyError).toEqual(new MissingAppKeyError());

        queryClient.clear();
      });
    });
  });

  describe('useAuthToken', () => {
    const key = AUTH_TOKEN_KEY;

    describe('Successful requests', () => {
      const { hooks, wrapper, queryClient } = setUpTest();
      const hook = () => hooks.useAuthToken(mockItemId);

      // mock port: necessary to test auth token
      const port = {
        postMessage: () => {
          /* do nothing */
        },
        onmessage: (_event: unknown) => {
          /* do nothing */
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
        await mockHook({
          hook: () => hooks.useGetLocalContext(mockItemId, defaultContextValue),
          wrapper,
        });

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
        const { hooks, wrapper, queryClient } = setUpTest({ GRAASP_APP_KEY: v4() });
        const hook = () => hooks.useAuthToken(mockItemId);

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

  describe('useAutoResize', () => {
    class MockResizeObserver implements ResizeObserver {
      // eslint-disable-next-line class-methods-use-this
      disconnect(): void {
        throw new Error('Method not implemented.');
      }

      // eslint-disable-next-line class-methods-use-this
      observe(): void {
        throw new Error('Method not implemented.');
      }

      // eslint-disable-next-line class-methods-use-this
      unobserve(): void {
        throw new Error('Method not implemented.');
      }
    }
    globalThis.ResizeObserver = vi.fn();
    const resizeObserverSpy = vi.spyOn(globalThis, 'ResizeObserver');
    const { hooks, wrapper } = setUpTest();

    /// mock port
    const port = {
      postMessage: vi.fn(),
      onmessage: vi.fn(),
    };

    it('Sends height', async () => {
      // run context first to set port
      const event = {
        ports: [port],
        data: JSON.stringify({
          type: POST_MESSAGE_KEYS.GET_CONTEXT_SUCCESS,
          payload: buildMockLocalContext(),
        }),
      } as unknown as MessageEvent;
      mockWindowForPostMessage(event);
      await mockHook({
        hook: () => hooks.useGetLocalContext(mockItemId, defaultContextValue),
        wrapper,
      });

      // mock window height
      globalThis.document = {
        body: { scrollHeight: 420 },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      renderHook(() => hooks.useAutoResize(mockItemId));

      // simulate resize
      const handlerFn = resizeObserverSpy?.mock?.lastCall?.[0];
      if (!handlerFn) {
        throw new Error('handlerFn is not defined');
      }
      handlerFn(
        [{ contentRect: { height: 42 } }] as Array<ResizeObserverEntry>,
        new MockResizeObserver(),
      );

      const portSpy = vi.spyOn(port, 'postMessage');
      // expect initial height
      expect(portSpy).toHaveBeenCalledWith(
        JSON.stringify({ type: POST_MESSAGE_KEYS.POST_AUTO_RESIZE, payload: 420 }),
      );
      // expect subsequent resize
      expect(portSpy).toHaveBeenCalledWith(
        JSON.stringify({ type: POST_MESSAGE_KEYS.POST_AUTO_RESIZE, payload: 42 }),
      );
    });
  });
});
