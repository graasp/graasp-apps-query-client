import { parseStringToDate } from '@graasp/sdk';
import axios from 'axios';

const configureAxios = () => {
  axios.defaults.withCredentials = true;

  axios.defaults.transformResponse = [
    (data) => {
      try {
        const content = JSON.parse(data);
        return parseStringToDate(content);
      } catch (e) {
        // the data was a normal string and we return it
        return data;
      }
    },
  ];

  return axios;
};

export default configureAxios;
