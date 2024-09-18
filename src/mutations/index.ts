import { QueryClientConfig } from '../types.js';
import appActionMutations from './appAction.js';
import appMutations from './appData.js';
import appSettingMutations from './appSetting.js';
import chatBotMutations from './chatBot.js';

const configureMutations = (queryConfig: QueryClientConfig) => ({
  ...appMutations(queryConfig),
  ...appSettingMutations(queryConfig),
  ...appActionMutations(queryConfig),
  ...chatBotMutations(queryConfig),
});

export default configureMutations;
