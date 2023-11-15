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
    mobile = false,
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
    mobile,
    standalone,
    settings,
  };
};

class CommunicationChannel {
  isMobile: boolean;

  channel: null | ((data: string) => void) = null;

  messagePort: MessagePort | null = null;

  messageHandler: ((evt: MessageEvent) => void) | null = null;

  constructor(
    args:
      | { isMobile: false; messagePort: MessagePort }
      | { isMobile: true; handler?: (evt: MessageEvent) => void },
  ) {
    this.isMobile = args.isMobile;
    if (args.isMobile) {
      if (args.handler) {
        this.addHandler(args.handler);
      }
    } else if (args.messagePort) {
      // when we are not on react native we use port communication
      this.messagePort = args.messagePort;
      this.channel = args.messagePort.postMessage;
    }
  }

  /**
   * Function to send Data from the app to the Parent
   * @param data Data to be sent to the parent
   */
  postMessage(data: unknown): void {
    if (this.isMobile) {
      window.parent.postMessage(JSON.stringify(data));
    } else {
      this.messagePort?.postMessage(JSON.stringify(data));
    }
  }

  addHandler(handler: (evt: MessageEvent) => void): void {
    this.messageHandler = handler;
    if (this.isMobile) {
      window.addEventListener('message', this.messageHandler);
    } else if (this.messagePort) {
      this.messagePort.onmessage = handler;
    }
  }

  removeHandler() {
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
    }
  }

  useHandler(handler: (evt: MessageEvent) => void): void {
    this.removeHandler();
    this.addHandler(handler);
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const configurePostMessageHooks = (queryConfig: QueryClientConfig) => {
  let communicationChannel: CommunicationChannel | null = null;

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
        queryConfig.notifier({
          type: 'error',
          payload: { message: (e as Error).message },
        });
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

          if (context.mobile) {
            communicationChannel = new CommunicationChannel({ isMobile: true });
          } else {
            communicationChannel = new CommunicationChannel({
              isMobile: false,
              messagePort: event.ports[0],
            });
          }
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
        queryConfig.notifier({
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
        if (!communicationChannel) {
          const error = new MissingMessageChannelPortError();
          queryConfig.notifier({
            type: 'error',
            payload: { message: 'No communication Channel available' },
          });
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

          communicationChannel?.useHandler(getAuthTokenFunction);
          communicationChannel?.postMessage({
            type: POST_MESSAGE_KEYS.GET_AUTH_TOKEN,
            payload: postMessagePayload,
          });
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
          communicationChannel?.postMessage(
            JSON.stringify({
              type: POST_MESSAGE_KEYS.POST_AUTO_RESIZE,
              payload: height,
            }),
          );
        };
        if (!communicationChannel) {
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
