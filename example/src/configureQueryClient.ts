import configureQueryClient from '@graasp/apps-query-client';
const queryConfig = {
  API_HOST: 'http://localhost:3000',
  notifier: (payload) => {
    console.log(payload);
  },
};

const { QueryClientProvider, queryClient, hooks, useMutation, mutations } =
  configureQueryClient(queryConfig);

export { QueryClientProvider, queryClient, hooks, useMutation, mutations };
