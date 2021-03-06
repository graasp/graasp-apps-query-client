/**
 * This file contains hooks using windowParent.postMessage
 * These are used before the app requests a token
 */

import { QueryClient, useQuery } from 'react-query';
import { RecordOf } from 'immutable';
import { DEFAULT_CONTEXT, DEFAULT_LANG, DEFAULT_PERMISSION } from '../config/constants';
import { AUTH_TOKEN_KEY, buildPostMessageKeys, LOCAL_CONTEXT_KEY } from '../config/keys';
import { LocalContext, LocalContextRecord, QueryClientConfig, WindowPostMessage } from '../types';
import { MissingMessageChannelPortError } from '../config/errors';
import { buildAppIdAndOriginPayload } from '../config/utils';
import { getAuthTokenRoutine, getLocalContextRoutine } from '../routines';

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

const configurePostMessageHooks = (_queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  let port2: MessagePort;

  const postMessage: WindowPostMessage = (data) => {
    const targetWindow = queryConfig?.targetWindow ?? window.parent;
    if (targetWindow?.postMessage) {
      targetWindow.postMessage(JSON.stringify(data), '*');
    } else {
      console.error('unable to find postMessage');
    }
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
    <A>(
      successType: string,
      errorType: string,
      {
        resolve,
        reject,
      }: {
        resolve: (value: A) => void;
        reject: (reason?: unknown) => void;
      },
      formatResolvedValue?: (data: { payload: any; event: MessageEvent }) => A,
    ) =>
    (event: MessageEvent) => {
      try {
        const { type, payload } = JSON.parse(event.data) || {};
        const format = formatResolvedValue ?? ((data: { payload: any }) => data.payload);
        // get init message getting the Message Channel port
        if (type === successType) {
          resolve(format({ payload, event }));
        } else if (type === errorType) {
          reject({ payload, event });
        } else {
          reject('the type is not recognised');
        }
      } catch (e) {
        reject('an error occured');
      }
    };

  let getLocalContextFunction: ((event: MessageEvent) => void) | null = null;
  const useGetLocalContext = (itemId: string) =>
    useQuery({
      queryKey: LOCAL_CONTEXT_KEY,
      queryFn: async () => {
        const POST_MESSAGE_KEYS = buildPostMessageKeys(itemId);
        const postMessagePayload = buildAppIdAndOriginPayload(queryConfig);

        const formatResolvedValue = (result: {
          event: MessageEvent;
          payload: LocalContext;
        }): RecordOf<LocalContext> => {
          const { event, payload } = result;
          // get init message getting the Message Channel port
          const context = buildContext(payload);

          // will use port for further communication
          // set as a global variable
          [port2] = event.ports;

          return LocalContextRecord(context);
        };

        return new Promise<RecordOf<LocalContext>>((resolve, reject) => {
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

          // request parent to provide item data (item id, settings...) and access token
          postMessage({
            type: POST_MESSAGE_KEYS.GET_CONTEXT,
            payload: postMessagePayload,
          });
        });
      },
      onError: (error) => {
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

  let getAuthTokenFunction = null;
  const useAuthToken = (itemId: string) =>
    useQuery({
      queryKey: AUTH_TOKEN_KEY,
      queryFn: () => {
        const POST_MESSAGE_KEYS = buildPostMessageKeys(itemId);
        if (!port2) {
          const error = new MissingMessageChannelPortError();
          console.error(error);
          throw error;
        }
        const postMessagePayload = buildAppIdAndOriginPayload(queryConfig);

        return new Promise<string>((resolve, reject) => {
          getAuthTokenFunction = receiveContextMessage(
            POST_MESSAGE_KEYS.GET_AUTH_TOKEN_SUCCESS,
            POST_MESSAGE_KEYS.GET_AUTH_TOKEN_FAILURE,
            {
              resolve,
              reject,
            },
            (data: { payload: { token: string } }): string => {
              return data.payload.token;
            },
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
      onError: (error) => {
        queryConfig?.notifier?.({
          type: getAuthTokenRoutine.FAILURE,
          payload: { error },
        });
      },
    });

  return {
    useGetLocalContext,
    useAuthToken,
  };
};

export default configurePostMessageHooks;
