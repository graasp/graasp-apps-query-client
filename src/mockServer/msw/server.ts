import { LocalContext } from '@graasp/sdk';

import { SetupWorker, setupWorker } from 'msw/browser';

import { Database } from '../../types.js';
import { buildMockLocalContext } from '../fixtures.js';
import { buildMSWMocks } from './handlers.js';

/**
 * Creates and launches a mock server using MSW and IndexedDB
 */
export const mockServiceWorkerServer = ({
  appContext,
  database,
  dbName,
}: {
  appContext: Partial<LocalContext> & Pick<LocalContext, 'itemId'>;
  database?: Database;
  dbName?: string;
}): { worker: SetupWorker; resetDB: (data: Database) => void } => {
  const fullAppContext = buildMockLocalContext(appContext);
  const mswMocks = buildMSWMocks(fullAppContext, database, dbName);
  mswMocks.db.on('populate', (transaction) => {
    if (database) {
      // seed database with data
      console.debug('Populating the DB with provided mock data');
      if (database.items?.length) {
        transaction.table('item').bulkAdd(database?.items);
      }
      if (database.members?.length) {
        transaction.table('member').bulkAdd(database.members);
      }
      if (database.appData?.length) {
        transaction.table('appData').bulkAdd(database.appData);
      }
      if (database.appActions?.length) {
        transaction.table('appAction').bulkAdd(database.appActions);
      }
      if (database.appSettings?.length) {
        transaction.table('appSetting').bulkAdd(database.appSettings);
      }
      if (database.uploadedFiles?.length) {
        transaction.table('uploadedFiles').bulkAdd(database.uploadedFiles);
      }
      transaction.table('appContext').add(fullAppContext, fullAppContext.accountId);
    } else {
      console.debug('There was no data to populate the database');
    }
  });

  // This configures a Service Worker with the given request handlers.
  const worker = setupWorker(...mswMocks.handlers);
  worker.start({ waitUntilReady: true, onUnhandledRequest: 'warn' });

  return { worker, resetDB: mswMocks.db.resetDB };
};
