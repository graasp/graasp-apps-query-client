import axios from 'axios';

const configureAxios = (): typeof axios => {
  axios.defaults.withCredentials = true;

  return axios;
};

export default configureAxios;
