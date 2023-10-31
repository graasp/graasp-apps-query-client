import { Database, LocalContext } from '../types';
import { buildDatabase, buildMockLocalContext } from './fixtures';
import { mockMirageServer } from './mirage/server';
import { mockServiceWorkerServer } from './msw/server';
import { ExternalUrls } from './types';

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
  }: {
    appContext: Partial<LocalContext> & Pick<LocalContext, 'itemId'>;
    database?: Database;
    externalUrls?: ExternalUrls;
    errors?: {
      deleteAppDataShouldThrow?: boolean;
    };
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
      mockServiceWorkerServer({ appContext, database });
      break;
  }
};

export default mockApi;
