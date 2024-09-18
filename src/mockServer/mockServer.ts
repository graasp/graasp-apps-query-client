import { LocalContext } from '@graasp/sdk';

import { Database } from '../types.js';
import { buildDatabase, buildMockLocalContext } from './fixtures.js';
import { mockMirageServer } from './mirage/server.js';
import { mockServiceWorkerServer } from './msw/server.js';
import { ExternalUrls } from './types.js';

export enum MockSolution {
  MirageJS = 'mirage',
  ServiceWorker = 'service-worker',
}

const mockApi = (
  {
    appContext: c,
    database,
    externalUrls,
    errors,
    dbName,
  }: {
    appContext: Partial<LocalContext> & Pick<LocalContext, 'itemId'>;
    database?: Database;
    externalUrls?: ExternalUrls;
    errors?: {
      deleteAppDataShouldThrow?: boolean;
    };
    dbName?: string;
  },
  solution: `${MockSolution}` | MockSolution,
): void => {
  const appContext = buildMockLocalContext(c);
  // automatically append item id as a query string
  const searchParams = new URLSearchParams(window.location.search);
  if (!searchParams.get('itemId')) {
    searchParams.set('itemId', appContext.itemId);
    window.location.search = searchParams.toString();
  }
  switch (solution) {
    case MockSolution.MirageJS:
      mockMirageServer({
        database: buildDatabase(database),
        appContext,
        externalUrls,
        errors,
      });
      break;
    case MockSolution.ServiceWorker:
    default:
      mockServiceWorkerServer({ appContext, database, dbName });
      break;
  }
};

export default mockApi;
