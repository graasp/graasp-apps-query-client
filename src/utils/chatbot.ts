import { ChatBotMessage, ChatbotRole } from '@graasp/sdk';

import { ChatbotThreadMessage } from '../types.js';

export const buildPrompt = (
  initialPrompt: string | undefined,
  threadMessages: ChatbotThreadMessage[],
  userMessage: string,
): Array<ChatBotMessage> => {
  // define the message to send to OpenAI with the initial prompt first if needed (role system).
  // Each call to OpenAI must contain the whole history of the messages.
  const finalPrompt: Array<ChatBotMessage> = initialPrompt
    ? [{ role: ChatbotRole.System, content: initialPrompt }]
    : [];

  threadMessages.forEach((msg) => {
    const msgRole = msg.msgType === msg.botDataType ? ChatbotRole.Assistant : ChatbotRole.User;
    finalPrompt.push({ role: msgRole, content: msg.data });
  });

  // add the last user's message in the prompt
  finalPrompt.push({ role: ChatbotRole.User, content: userMessage });

  return finalPrompt;
};
