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

3. Define `mockContext` and `buildDatabase` depending on your needs in `src/mock/db.js`. For an empty database, and to display the app for a writer in builder, use:

```js
// todo: use constants
export const mockContext = {
  permission: `write`,
  context: 'builder',
};

const buildDatabase = (appContext) => ({
  appData: [],
  appActions: [],
  members: [
    {
      id: appContext.memberId,
      name: 'mock-member',
    },
  ],
});

export default buildDatabase;
```

4. Configure your query client with the following code. You can define `mockContext` with the property you need for your local development.

```js
import {
  configureQueryClient,
  buildMockLocalContext,
  buildMockParentWindow,
} from '@graasp/apps-query-client';
import { mockContext } from '../mock/db';

configureQueryClient({
  GRAASP_APP_ID: process.env.REACT_APP_GRAASP_APP_ID,
  targetWindow: MOCK_API
    ? // build mock parent window given cypress (app) context or mock data
      buildMockParentWindow(
        buildMockLocalContext(window.appContext ?? mockContext),
      )
    : window.parent,
});
```

5. Add the following content in `src/index.js`.

```js
import { mockServer, buildMockLocalContext } from '@graasp/apps-query-client';
import buildDatabase, { mockContext } from './mock/db';

if (process.env.REACT_APP_MOCK_API) {
  const appContext = buildMockLocalContext(window.appContext ?? mockContext);
  // automatically redirects to the correct url
  const searchParams = new URLSearchParams(window.location.search);
  if (!searchParams.get('itemId')) {
    searchParams.set('itemId', appContext.itemId);
    window.location.search = searchParams.toString();
  }
  // set up the mock database
  const database = window.Cypress ? window.database : buildDatabase(appContext);

  const errors = window.apiErrors;
  mockServer({ database, appContext, errors });
}
```

6. Add the `ContextContext` and the `TokenContext` files in your app in `src/components/context`. It will handle the authentication and fetching the local context automatically for you. Don't forget to always mount these contexts (in `<Root/>` and `<App/>`).

#### TokenContext.js

```js
import React, { createContext } from 'react';
import PropTypes from 'prop-types';
import qs from 'qs';
import { hooks } from '../../config/queryClient';

const TokenContext = createContext();

const TokenProvider = ({ children }) => {
  const { itemId } = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  });
  const { data, isLoading, isError } = hooks.useAuthToken(itemId);

  if (isLoading) {
    return 'loading...';
  }

  if (isError) {
    console.error('An error occured while requesting the token.');
  }

  const value = data;
  return (
    <TokenContext.Provider value={value}>{children}</TokenContext.Provider>
  );
};

TokenProvider.propTypes = {
  children: PropTypes.node,
};

TokenProvider.defaultProps = {
  children: null,
};

export { TokenContext, TokenProvider };
```

#### ContextContext.js

```js
import React, { createContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import qs from 'qs';
import { hooks } from '../../config/queryClient';

const Context = createContext();

const ContextProvider = ({ children }) => {
  const { itemId } = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  });
  const {
    data: context,
    isLoading,
    isError,
  } = hooks.useGetLocalContext(itemId);

// here is a good place to change the app language

  if (isLoading) {
    return 'loading...';
  }

  if (isError) {
    console.error('An error occured while fetching the context.');
  }

  // todo: define a context to default to  
  const value = context ?? DEFAULT_LOCAL_CONTEXT;

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

ContextProvider.propTypes = {
  children: PropTypes.node,
};

ContextProvider.defaultProps = {
  children: null,
};

export { Context, ContextProvider };
```

7. Optionally, you can create an util file for custom hooks. For instance, the following hook fetches the data from the local context and the token context to avoid redondance.

```js
export const useAppData = () => {
  const context = useContext(Context);
  const token = useContext(TokenContext);
  const query = hooks.useAppData(
    { token, itemId: context?.get('itemId') },
  );
  return query;
};
```

You can now start your app with the mock API installed. Don't forget to disable it when you build your app.

### Cypress

The next steps will help you set up Cypress to work with MirageJS. There is an [official tutorial](https://miragejs.com/quickstarts/cypress/) from MirageJS. But in our case, we followed a different strategy.

1. Add in `cypress/support/commands.js`. You will need to define `MOCK_SERVER_ITEM`, `MEMBERS` and `CURRENT_MEMBER` to reuse them in your tests as well.

```js
Cypress.Commands.add(
  'setUpApi',
  ({ currentMember = CURRENT_MEMBER, database = {}, appContext } = {}) => {
    // mock api and database
    Cypress.on('window:before:load', (win) => {
      win.database = {
        currentMember,
        currentItemId: MOCK_SERVER_ITEM.id,
        members: Object.values(MEMBERS),
        ...database,
      };
      win.appContext = appContext;
    });
  }
);
```

2. Then in all your tests you will need to set up the database and context. The default values are configured so you can easily mount an empty and operational database.

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
