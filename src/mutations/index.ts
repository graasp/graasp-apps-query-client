import { QueryClientConfig } from '../types';
import appActionMutations from './appAction';
import appMutations from './appData';
import appSettingMutations from './appSetting';
import chatBotMutations from './chatBot';

const configureMutations = (queryConfig: QueryClientConfig) => ({
  ...appMutations(queryConfig),
  ...appSettingMutations(queryConfig),
  ...appActionMutations(queryConfig),
  ...chatBotMutations(queryConfig),
});

export default configureMutations;
