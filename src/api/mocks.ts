import { LocalContext, Token } from '../types';
import configureAxios from './axios';

const axios = configureAxios();

export const getMockContext = async (args: { token: Token }): Promise<LocalContext> => {
  const { token } = args;
  return axios
    .get(`/__mocks/context`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data);
};
