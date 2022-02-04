import { QueryClient, useQuery } from 'react-query';
import { Map } from 'immutable';
import { DEFAULT_MODE, DEFAULT_VIEW } from '../config/constants';
import { AUTH_TOKEN_KEY, LOCAL_CONTEXT_KEY, POST_MESSAGE_KEYS } from '../config/keys';
import { LocalContext, QueryClientConfig, WindowPostMessage } from '../types';

const configurePostMessageHooks = (_queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  let port2: MessagePort;

  // build context from given data and default values
  const buildContext = (payload: LocalContext) => {
    const {
      apiHost,
      memberId,
      itemId,
      permission = DEFAULT_MODE, // write, admin, read
      context = DEFAULT_VIEW, // builder, explorer..., null = standalone
      lang = 'en',
      offline = 'false',
      dev = 'false',
      settings = {},
    } = payload;

    const offlineBool = offline === 'true';

    // use fake api
    const devBool = dev === 'true';

    const standalone = context === null;

    return {
      apiHost,
      context,
      permission,
      itemId,
      memberId,
      lang,
      offline: offlineBool,
      dev: devBool,
      standalone,
      settings,
    };
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
    (
      successType: string,
      errorType: string,
      {
        resolve,
        reject,
      }: {
        resolve: (value: unknown) => void;
        reject: (reason?: any) => void;
      },
      formatResolvedValue?: (data: { payload: any; event: MessageEvent }) => unknown,
    ) =>
    (event: MessageEvent) => {
      const { type, payload } = JSON.parse(event.data) || {};
      const format = formatResolvedValue ?? ((data: { payload: unknown }) => data.payload);

      // get init message getting the Message Channel port
      if (type === successType) {
        resolve(format({ payload, event }));
      } else if (type === errorType) {
        reject({ payload, event });
      } else {
        reject('the type is not recognised');
      }
    };

  let getLocalContextFunction: ((event: MessageEvent) => void) | null = null;
  const useGetLocalContext = (
    payload: { app: string; origin: string },
    postMessage: WindowPostMessage,
  ) =>
    useQuery({
      queryKey: LOCAL_CONTEXT_KEY,
      queryFn: () => {
        const formatResolvedValue = (result: { event: MessageEvent; payload: LocalContext }) => {
          const { event, payload } = result;
          // get init message getting the Message Channel port
          const context = buildContext(payload);

          // will use port for further communication
          // set as a global variable
          [port2] = event.ports;

          return Map(context);
        };

        return new Promise((resolve, reject) => {
          getLocalContextFunction = receiveContextMessage(
            POST_MESSAGE_KEYS.GET_CONTEXT_SUCCEEDED,
            POST_MESSAGE_KEYS.GET_CONTEXT_FAILED,
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
            payload,
          });
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
  const useAuthToken = () =>
    useQuery({
      queryKey: AUTH_TOKEN_KEY,
      queryFn: () => {
        if (!port2) {
          throw new Error('Get context first');
        }

        return new Promise((resolve, reject) => {
          getAuthTokenFunction = receiveContextMessage(
            POST_MESSAGE_KEYS.GET_AUTH_TOKEN_SUCCEEDED,
            POST_MESSAGE_KEYS.GET_AUTH_TOKEN_FAILED,
            {
              resolve,
              reject,
            },
            (data: { payload: { token: string } }) => {
              return data.payload.token;
            },
          );

          port2.onmessage = getAuthTokenFunction;

          port2?.postMessage(
            JSON.stringify({
              type: POST_MESSAGE_KEYS.GET_AUTH_TOKEN,
              payload: {
                app: queryConfig.GRAASP_APP_ID,
                origin: window.location.origin,
              },
            }),
          );
        });
      },

      enabled: Boolean(port2),
    });

  return {
    useGetLocalContext,
    useAuthToken,
  };
};

export default configurePostMessageHooks;
