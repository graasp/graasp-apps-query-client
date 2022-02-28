import { POST_MESSAGE_KEYS } from '../config/keys';

const channel = new MessageChannel();

channel.port1.onmessage = async (e) => {
  const { data } = e;

  const { type } = JSON.parse(data);

  switch (type) {
    case POST_MESSAGE_KEYS.GET_AUTH_TOKEN:
      channel?.port1.postMessage(
        JSON.stringify({
          type: POST_MESSAGE_KEYS.GET_AUTH_TOKEN_SUCCESS,
          payload: {
            token: 'MOCK_TOKEN',
          },
        }),
      );
      break;
    default:
      console.log(`type '${type}' is not recognized`);
  }
};

export const buildMockParentWindow = (context) => ({
  postMessage: (message) => {
    const { type } = JSON.parse(message);
    if (type === POST_MESSAGE_KEYS.GET_CONTEXT) {
      window.postMessage(
        JSON.stringify({
          type: POST_MESSAGE_KEYS.GET_CONTEXT_SUCCESS,
          payload: context,
        }),
        '*',
        [channel.port2],
      );
    } else {
      console.log(`${type} is not recognised`);
    }
  },
});
