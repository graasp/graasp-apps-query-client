import { Database } from './types';

// extend the Window interface with the new properties
declare global {
  interface Window {
    appContext: object;
    Cypress: boolean;
    // this needs to be defined in accordance to the other usages
    database: Database;
    apiErrors: object;
  }
}

// empty export to remove the "module" error
export { };
