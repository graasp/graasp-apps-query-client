import { LocalContext } from '@graasp/sdk';

import { Database } from './types.js';

// extend the Window interface with the new properties
declare global {
  interface Window {
    appContext: LocalContext;
    Cypress: boolean;
    // this needs to be defined in accordance to the other usages
    database: Database;
    apiErrors: object;
  }
}

// empty export to remove the "module" error
export {};
