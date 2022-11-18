# Graasp Apps Query Client

This repository implements the [react-query](https://react-query.tanstack.com/) hooks and mutations for apps to consume the Graasp Apps API. It also provides a mock API server based on [MirageJS](https://miragejs.com/) for local development.

## Mock API Installation

This apps-query-client package provides a mock API to mock any call an app might use to consume the Graasp API. It is based on MirageJS, which simulates the network requests themselves, and can thus remember remote state in memory. So the database is preserved as long as the app is not refreshed. This mock API is also particularly useful for continuous integration tests.

The following steps are designed to take into account `Cypress`, our test framework. So the mock database can also receive data from the tests and apply them.

**!WARNING: The mock API cannot fake uploading and downloading files!**

1. Install the `env-cmd` dependency. Create a new script `start:local` in `package.json`:

```json
"start:local": "env-cmd -f ./.env.development react-scripts start"
```

2. Create `.env.development` which will contain the variables below. The app id you will choose doesn't have to be valid, but needs to exist.

```
REACT_APP_GRAASP_APP_ID=<your app id>
REACT_APP_MOCK_API=true
```

3. Configure your query client in `src/config/queryClient.js` with the following code.

```js
import {
  configureQueryClient,
  buildMockLocalContext,
  buildMockParentWindow,
} from '@graasp/apps-query-client';

const values = configureQueryClient({
  GRAASP_APP_ID: process.env.REACT_APP_GRAASP_APP_ID,
  // build mock parent window given cypress (app) context or mock data
  targetWindow: process.env.REACT_APP_MOCK_API === 'true'
    ? buildMockParentWindow(
        buildMockLocalContext(window.appContext),
      )
    : window.parent,
});
export values;
```

4. Add the following content in `src/index.js`. `mockApi` can take a defined context and/or database if necessary (see the Cypress section)

```js
import { mockApi } from '@graasp/apps-query-client';

if (process.env.REACT_APP_MOCK_API === 'true') {
  mockApi();
}
```

5. Use the [`withContext`](./src/components/withContext.tsx) and the [`withToken`](./src/components/withToken.tsx) files in your app. It will handle the authentication and fetching the local context automatically for you. For example:

```js
const AppWithContext = withToken(App, {
  LoadingComponent: <Loader />,
  useAuthToken: hooks.useAuthToken,
  onError: () => {
    showErrorToast('An error occured while requesting the token.');
  },
});

const AppWithContextAndToken = withContext(AppWithContext, {
  LoadingComponent: <Loader />,
  useGetLocalContext: hooks.useGetLocalContext,
  useAutoResize: hooks.useAutoResize,
  onError: () => {
    showErrorToast('An error occured while fetching the context.');
  },
});
```

You can now start your app with the mock API installed. **Don't forget to disable it when you build your app** (set `REACT_APP_MOCK_API` to `false`).

### Cypress

The next steps will help you set up Cypress to work with MirageJS. There is an [official tutorial](https://miragejs.com/quickstarts/cypress/) from MirageJS. But in our case, we followed a different strategy.

1. Update your content in `src/index.js` to include some config defined from Cypress in the mock server:

```js
if (process.env.REACT_APP_MOCK_API === 'true') {
  mockApi({
    appContext: window.Cypress ? window.appContext : undefined,
    database: window.Cypress ? window.database : undefined,
  });
}
```

2. Add the following in `cypress/support/commands.js`. You will need to define `MEMBERS` and `CURRENT_MEMBER` to reuse them in your tests as well.

```js
import { buildDatabase } from '@graasp/apps-query-client';

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
  },
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
