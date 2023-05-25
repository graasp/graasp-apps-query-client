import { buildPostMessageKeys } from '../config/keys';
import { LocalContext } from '../types';

const channel = new MessageChannel();

export const buildMockParentWindow = (context: LocalContext) => {
  const POST_MESSAGE_KEYS = buildPostMessageKeys(context?.itemId);

  channel.port1.onmessage = async (e) => {
    const { data } = e;

    const { type } = JSON.parse(data);

    switch (type) {
      case POST_MESSAGE_KEYS.GET_AUTH_TOKEN:
        console.log(channel, channel.port1, channel.port2);
        channel?.port1.postMessage(
          JSON.stringify({
            type: POST_MESSAGE_KEYS.GET_AUTH_TOKEN_SUCCESS,
            payload: {
              token: 'MOCK_TOKEN',
            },
          }),
        );
        console.log('debug get auth token');
        break;
      default:
        console.log(`type '${type}' is not recognized`);
    }
  };

  return {
    postMessage: (message: string) => {
      const { type } = JSON.parse(message);
      if (type === POST_MESSAGE_KEYS.GET_CONTEXT) {
        console.log(channel, channel.port1, channel.port2);
        window.postMessage(
          JSON.stringify({
            type: POST_MESSAGE_KEYS.GET_CONTEXT_SUCCESS,
            payload: context,
          }),
          '*',
          [channel.port2],
        );
        console.log('debug post message')
      } else {
        console.log(`${type} is not recognised`);
      }
    },
  };
};
