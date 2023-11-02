/**
 * This file contains hooks using windowParent.postMessage
 * These are used before the app requests a token
 */
import { useEffect } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import * as Api from '../api';
import { DEFAULT_CONTEXT, DEFAULT_LANG, DEFAULT_PERMISSION, MOCK_TOKEN } from '../config/constants';
import { MissingMessageChannelPortError } from '../config/errors';
import { AUTH_TOKEN_KEY, LOCAL_CONTEXT_KEY, buildPostMessageKeys } from '../config/keys';
import { buildAppKeyAndOriginPayload } from '../config/utils';
import { getAuthTokenRoutine, getLocalContextRoutine } from '../routines';
import { LocalContext, QueryClientConfig, WindowPostMessage } from '../types';

// build context from given data and default values
export const buildContext = (payload: LocalContext): LocalContext => {
  const {
    apiHost,
    memberId,
    itemId,
    permission = DEFAULT_PERMISSION, // write, admin, read
    context = DEFAULT_CONTEXT, // builder, explorer..., null = standalone
    lang = DEFAULT_LANG,
    offline = false,
    dev = false,
    settings = {},
  } = payload;

  const standalone = context === null;
  return {
    apiHost,
    context,
    permission,
    itemId,
    memberId,
    lang,
    offline,
    dev,
    standalone,
    settings,
  };
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const configurePostMessageHooks = (queryConfig: QueryClientConfig) => {
  let port2: MessagePort;

  const postMessage: WindowPostMessage = (data: unknown) => {
    console.debug('[app-postMessage] sending:', data);
    if (queryConfig?.isStandalone) {
      console.warn(
        '[app-postMessage] Running in standalone mode, you should not call postMessage, something might be wrong',
      );
      return;
    }
    window.parent.postMessage(JSON.stringify(data), '*');
  };

  /**
   * Builder function creating on message event handler
   * @param  {string} successType returned type when the request succeeded
   * @param  {string} errorType returned type when the request failed
   * @param  {Function} resolve function to resolve the promise
   * @param  {Function} reject function to reject the promise
   * @param  {Function} formatResolvedValue function formatting the event data
   * @returns event function handler
   */
  const receiveContextMessage =
    <A, B>(
      successType: string,
      errorType: string,
      {
        resolve,
        reject,
      }: {
        resolve: (value: A) => void;
        reject: (reason?: unknown) => void;
      },
      formatResolvedValue: (data: { payload: B; event: MessageEvent }) => A,
    ) =>
    (event: MessageEvent) => {
      try {
        // ignore noise messages
        if (typeof event.data !== 'string') {
          return;
        }

        const { type, payload } = JSON.parse(event.data) || {};
        console.debug('[app-receive-context] context: ', type, payload);
        // get init message getting the Message Channel port
        if (type === successType) {
          resolve(formatResolvedValue({ payload, event }));
        } else if (type === errorType) {
          reject({ payload, event });
        } else {
          reject(`the type '${type}' for payload '${JSON.stringify(payload)}' is not recognized`);
        }
      } catch (e) {
        reject('an error occurred');
      }
    };

  const useGetLocalContext = (itemId: string, defaultValue: LocalContext) => {
    let getLocalContextFunction: ((event: MessageEvent) => void) | null = null;
    const queryClient = useQueryClient();
    return useQuery({
      queryKey: LOCAL_CONTEXT_KEY,
      queryFn: async () => {
        console.debug('[app-get-local-context] getting local context');
        if (queryConfig.isStandalone) {
          const authToken = queryClient.getQueryData<string>(AUTH_TOKEN_KEY);
          if (authToken) {
            const newContext = await Api.getMockContext({
              token: authToken,
            });
            return buildContext(newContext);
          }
          console.debug(
            '[app-get-local-context] token was not found in data cache, using default value',
          );
          return buildContext(defaultValue);
        }
        const POST_MESSAGE_KEYS = buildPostMessageKeys(itemId);
        const postMessagePayload = buildAppKeyAndOriginPayload(queryConfig);

        const formatResolvedValue = (result: {
          event: MessageEvent;
          payload: LocalContext;
        }): LocalContext => {
          const { event, payload } = result;
          // get init message getting the Message Channel port
          const context = buildContext(payload);

          // will use port for further communication
          // set as a global variable
          [port2] = event.ports;
          return context;
        };

        return new Promise<LocalContext>((resolve, reject) => {
          getLocalContextFunction = receiveContextMessage(
            POST_MESSAGE_KEYS.GET_CONTEXT_SUCCESS,
            POST_MESSAGE_KEYS.GET_CONTEXT_FAILURE,
            {
              resolve,
              reject,
            },
            formatResolvedValue,
          );
          window.addEventListener('message', getLocalContextFunction);

          // request parent to provide item data (item id, settings...)
          postMessage({
            type: POST_MESSAGE_KEYS.GET_CONTEXT,
            payload: postMessagePayload,
          });
        });
      },
      onError: (error: Error) => {
        queryConfig?.notifier?.({
          type: getLocalContextRoutine.FAILURE,
          payload: { error },
        });
      },
      onSettled: () => {
        // stop to listen to window message
        if (getLocalContextFunction) {
          window.removeEventListener('message', getLocalContextFunction);
        }
      },
    });
  };

  const useAuthToken = (itemId: string) => {
    let getAuthTokenFunction;
    const queryClient = useQueryClient();
    return useQuery({
      queryKey: AUTH_TOKEN_KEY,
      queryFn: () => {
        console.debug('[app-auth-token] get token');
        if (queryConfig.isStandalone) {
          const context = queryClient.getQueryData<LocalContext>(LOCAL_CONTEXT_KEY);
          if (context) {
            return `${MOCK_TOKEN} ${context.memberId}`;
          }
          throw new Error('there was an error getting the query data for the LocalContext');
        }
        const POST_MESSAGE_KEYS = buildPostMessageKeys(itemId);
        if (!port2) {
          const error = new MissingMessageChannelPortError();
          console.error(error);
          throw error;
        }
        const postMessagePayload = buildAppKeyAndOriginPayload(queryConfig);

        return new Promise<string>((resolve, reject) => {
          getAuthTokenFunction = receiveContextMessage(
            POST_MESSAGE_KEYS.GET_AUTH_TOKEN_SUCCESS,
            POST_MESSAGE_KEYS.GET_AUTH_TOKEN_FAILURE,
            {
              resolve,
              reject,
            },
            (data: { payload: { token: string } }): string => data.payload.token,
          );

          port2.onmessage = getAuthTokenFunction;
          port2.postMessage(
            JSON.stringify({
              type: POST_MESSAGE_KEYS.GET_AUTH_TOKEN,
              payload: postMessagePayload,
            }),
          );
        });
      },
      onError: (error: Error) => {
        queryConfig?.notifier?.({
          type: getAuthTokenRoutine.FAILURE,
          payload: { error },
        });
      },
    });
  };

  const useAutoResize = (itemId: string): void => {
    const POST_MESSAGE_KEYS = buildPostMessageKeys(itemId);

    useEffect(() => {
      if (!queryConfig.isStandalone) {
        const sendHeight = (height: number): void => {
          port2.postMessage(
            JSON.stringify({
              type: POST_MESSAGE_KEYS.POST_AUTO_RESIZE,
              payload: height,
            }),
          );
        };
        if (!port2) {
          const error = new MissingMessageChannelPortError();
          console.error(error);
        }

        // send the current height first: since useEffect runs after the first render
        // the host is never informed of the initial app size otherwise
        sendHeight(document.body.scrollHeight);

        // subsequent updates are handled by the resize observer
        const resizeObserver = new ResizeObserver((entries) => {
          entries.forEach((entry) => {
            const { height } = entry.contentRect;
            sendHeight(height);
          });
        });
        resizeObserver.observe(document.body);

        return () => resizeObserver.disconnect();
      }
      return () => {};
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemId]);
  };

  return {
    useGetLocalContext,
    useAuthToken,
    useAutoResize,
  };
};

export default configurePostMessageHooks;
