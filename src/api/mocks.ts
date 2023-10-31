import { LocalContext, Token } from '../types';
import configureAxios from './axios';

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
