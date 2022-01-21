import React from 'react';
import { hooks, useMutation } from './configureQueryClient';

const token = 'token';
const itemId = 'itemId';

const App = () => {
  const { mutate: deleteAppData }: any = useMutation('deleteAppData');
  const { data: appData, isLoading }: any = hooks.useAppData({ token, itemId });

  const onClick = () => {
    // use the post item mutation
    // the payload is incorrect, so it will fail
    deleteAppData({ id: 'myitemid', token, itemId });
  };

  const renderMyItems = () => {
    if (isLoading) {
      return 'Fetching data...';
    }

    return <div>My data: {JSON.stringify(appData)}</div>;
  };

  return (
    <>
      <button type="button" onClick={onClick}>
        Delete an app data
      </button>
      {renderMyItems()}
    </>
  );
};

export default App;
