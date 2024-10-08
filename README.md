# Graasp Apps Query Client

[![Latest version published on NPM](https://img.shields.io/npm/v/@graasp/apps-query-client?logo=npm)](https://www.npmjs.com/package/@graasp/apps-query-client)
[![Latest version released on Github](https://img.shields.io/github/package-json/v/graasp/graasp-apps-query-client?color=deepskyblue&logo=github)](https://github.com/graasp/graasp-apps-query-client/releases/latest)
![NPM package downloads per month](https://img.shields.io/npm/dm/@graasp/apps-query-client?color=green)

![typescript version](https://img.shields.io/github/package-json/dependency-version/graasp/graasp-apps-query-client/dev/typescript)
![supported react versions](https://img.shields.io/npm/dependency-version/@graasp/apps-query-client/peer/react?logo=react)
![react-query version](https://img.shields.io/github/package-json/dependency-version/graasp/graasp-apps-query-client/react-query?logo=react-query)

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
REACT_APP_GRAASP_APP_KEY=<your app key>
REACT_APP_ENABLE_MOCK_API=true
```

3. Configure your query client in `src/config/queryClient.js` with the following code.

```js
import {
  configureQueryClient,
  buildMockLocalContext,
  buildMockParentWindow,
} from '@graasp/apps-query-client';

const values = configureQueryClient({
  GRAASP_APP_KEY: process.env.REACT_APP_GRAASP_APP_KEY,
  isStandalone: MOCK_API,
});
export values;
```

4. Add the following content in `src/index.js`. `mockApi` can take a defined context and/or database if necessary (see the Cypress section)

```js
import { mockApi } from '@graasp/apps-query-client';

if (process.env.REACT_APP_ENABLE_MOCK_API === 'true') {
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

You can now start your app with the mock API installed. **Don't forget to disable it when you build your app** (set `REACT_APP_ENABLE_MOCK_API` to `false`).

### Cypress

The next steps will help you set up Cypress to work with MirageJS. There is an [official tutorial](https://miragejs.com/quickstarts/cypress/) from MirageJS. But in our case, we followed a different strategy.

1. Update your content in `src/index.js` to include some config defined from Cypress in the mock server:

```js
if (process.env.REACT_APP_ENABLE_MOCK_API === 'true') {
  mockApi({
    appContext: window.Cypress ? window.appContext : undefined,
    database: window.Cypress ? window.database : undefined,
  });
}
```

2. Add the following in `cypress/support/commands.js`. You will need to define `MEMBERS` and `CURRENT_MEMBER` to reuse them in your tests as well.

```js
import { buildDatabase } from '@graasp/apps-query-client';

Cypress.Commands.add('setUpApi', ({ currentMember = CURRENT_MEMBER, database = {}, appContext } = {}) => {
  // mock api and database
  Cypress.on('window:before:load', (win) => {
    win.database = buildDatabase({
      members: Object.values(MEMBERS),
      ...database,
    });
    win.appContext = appContext;
  });
});
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

### Mock Uploaded files

If you need to have files in the mocked server, you can use the `uploadedFiles` array of the `setupApi`. The following are steps to follow if you want to upload and retrieve a file for an app.

1. Create a new `AppSetting` and add it in the `appSettings` array of the `setupApi` (in the Cypress test of the frontend).

```ts
// MOCK_FILE_APP_SETTING
{
  id: mockFileSettingId,
  name: 'file', // should be named `file`! Do not change it!
  data: {
    path: `apps/app-setting/${item.id}/${mockFileSettingId}`, // This path should be mocked in the MSW! If you want to use another path, you just have to mock it.
  },
  item,
  creator,
  createdAt,
  updatedAt,
};
```

2. Load a file and transform it into a `File` type. With Cypress, have a look to `cy.fixtures` (put the `setupApi` in the `then` callback).
3. Add the loaded file in the array.

```ts
uploadedFiles: [
  {
    id: MOCK_FILE_APP_SETTING.id,
    file,
  },
],
```

4. Use the mocked route `GET /app-items/app-settings/:appSettingId/download` (or your mocked route) to retrieve the path of the file.
5. Use the result of the previous request to download the file. In this example, it's the route `GET /download-app-setting-url/:appSettingId`.

Another solution could be to upload your file from the Cypress test, by using the route `/app-items/app-settings-/upload?id=:itemId` for example.
