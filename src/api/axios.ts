import axios from 'axios';

const configureAxios = () => {
  axios.defaults.withCredentials = true;
  return axios;
};

export default configureAxios;
