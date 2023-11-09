import { QueryClientConfig } from '../types';
import appActionMutations from './appAction';
import appMutations from './appData';
import appSettingMutations from './appSetting';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const configureMutations = (queryConfig: QueryClientConfig) => ({
  ...appMutations(queryConfig),
  ...appSettingMutations(queryConfig),
  ...appActionMutations(queryConfig),
});

export default configureMutations;
