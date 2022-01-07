import { QueryClientConfig } from '../types';
import configureAppsHooks from './apps';

export default (
  queryConfig: QueryClientConfig,
) => {

  return {
    ...configureAppsHooks(queryConfig),
  };
};
