import { LocalContext } from '@graasp/sdk';

import { Token } from '../types.js';
import configureAxios from './axios.js';

const axios = configureAxios();

export const getMockContext = async (args: { token: Token }) => {
  const { token } = args;
  return axios
    .get<LocalContext>(`/__mocks/context`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
};
