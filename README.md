# Graasp Apps Query Client

This repository implements the [react-query](https://react-query.tanstack.com/) hooks and mutations for apps to consume the Graasp Apps API. It also provides a mock API server based on [MirageJS](https://miragejs.com/) for local development.

## Mock API Installation

This apps-query-client package provides a mock API to mock any call an app might use to consume the Graasp API. It is based on MirageJS, which simulates the network requests themselves, and can thus remember remote state in memory. So the database is preserved as long as the app is not refreshed. This mock API is also particularly useful for continuous integration tests. 

The following steps are designed to take into account `Cypress`, our test framework. So the mock database can also receive data from the tests and apply them.

**!WARNING: The mock API cannot fake uploading and downloading files!**

1. Install the `env-cmd` dependency. Change your `start` script in `package.json` for 

```
env-cmd -f ./.env.development react-scripts start
```

2. Create `.env.development` which will contain the variables below. The app id you will choose doesn't have to be valid, but needs to exist.

```
REACT_APP_GRAASP_APP_ID=<your app id>
REACT_APP_MOCK_API=true
```

3. Configure your query client with the following code.

```js
import {
  configureQueryClient,
  buildMockLocalContext,
  buildMockParentWindow,
} from '@graasp/apps-query-client';
import { mockContext } from '../mock/db';

configureQueryClient({
  GRAASP_APP_ID: process.env.REACT_APP_GRAASP_APP_ID,
  // build mock parent window given cypress (app) context or mock data
  targetWindow: MOCK_API
    ? buildMockParentWindow(
        buildMockLocalContext(window.appContext),
      )
    : window.parent,
});
```

4. Add the following content in `src/index.js`.

```js
import { mockServer, buildMockLocalContext } from '@graasp/apps-query-client';
import buildDatabase, { mockContext } from './mock/db';

if (process.env.REACT_APP_MOCK_API) {
  const appContext = buildMockLocalContext();
  // automatically append item id as a query string
  const searchParams = new URLSearchParams(window.location.search);
  if (!searchParams.get('itemId')) {
    searchParams.set('itemId', appContext.itemId);
    window.location.search = searchParams.toString();
  }
  const database = buildDatabase({ appData: [] });

  mockServer({ database, appContext });
}
```

5. Add the `ContextContext` and the `TokenContext` files in your app in `src/components/context`. It will handle the authentication and fetching the local context automatically for you. Don't forget to always mount these contexts (in `<Root/>` and `<App/>`). For example:

```js
 <ContextProvider
      LoadingComponent={<Loader />}
      useGetLocalContext={hooks.useGetLocalContext}
      onError={() => {
        showErrorToast('An error occured while fetching the context.');
      }}
  >
    <App />
  </ContextProvider>
```

You can now start your app with the mock API installed. Don't forget to disable it when you build your app.

### Cypress

The next steps will help you set up Cypress to work with MirageJS. There is an [official tutorial](https://miragejs.com/quickstarts/cypress/) from MirageJS. But in our case, we followed a different strategy.

1. Update your content in `index.js` to include some config defined from Cypress in the mock server:

```js
if (process.env.REACT_APP_MOCK_API) {
  const appContext = buildMockLocalContext(window.appContext);
  // automatically append item id as a query string
  const searchParams = new URLSearchParams(window.location.search);
  if (!searchParams.get('itemId')) {
    searchParams.set('itemId', appContext.itemId);
    window.location.search = searchParams.toString();
  }
  const database = window.Cypress
    ? window.database
    : buildDatabase({ appData: [] });

  mockServer({ database, appContext });
}
```

2. Add in `cypress/support/commands.js`. You will need to define `MEMBERS` and `CURRENT_MEMBER` to reuse them in your tests as well.

```js
Cypress.Commands.add(
  'setUpApi',
  ({ currentMember = CURRENT_MEMBER, database = {}, appContext } = {}) => {
    // mock api and database
    Cypress.on('window:before:load', (win) => {
      win.database = buildDatabase({
        members: Object.values(MEMBERS),
        ...database,
      });
      win.appContext = appContext;
    });
  }
);
```

3. Then in all your tests you will need to set up the database and context. The default values are configured so you can easily mount an empty and operational database.

```js
// start with an empty database
cy.setUpApi();

// start with one app data pre-saved in builder for an admin
cy.setUpApi({ 
  database: { appData: [MOCK_APP_DATA] }, 
  appContext: {
    permission: 'admin',
    context: 'builder',
  }, 
});
```
