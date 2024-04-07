import axios from 'axios';
import { objectToQueryString } from '../../shared/utils/url';
import { getUserAuthToken } from '../Services/Auth/auth-service';
import history from '../../browserHistory';
import { API_ERRORS } from '../constants/api-errors';

const defaults = {
  // baseURL: process.env.API_URL || 'http://localhost:3001',
  baseURL: 'https://the-4pm-store-server.ap-south-1.elasticbeanstalk.com',
  headers: () => ({
    'Content-Type': 'application/json',
    authToken: getUserAuthToken(),
  }),
};

const api = (method, url, variables) =>
  new Promise((resolve, reject) => {
    try {
      axios({
        url: `${defaults.baseURL}${url}`,
        method,
        headers: defaults.headers(),
        params: method === 'get' ? variables : undefined,
        data: method !== 'get' ? variables : undefined,
        paramsSerializer: objectToQueryString,
      })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          // User's session timed out, redirect user to login
          if (error.response?.data?.error == API_ERRORS.SESSION_EXPIRED) {
            reject('Session Expired');
            localStorage.removeItem('currentUser');
            setTimeout(() => {
              history.push('/login');
            });
            return;
          }
          console.error(error);
          reject(error);
        });
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });

export default {
  get: (...args) => api('get', ...args),
  post: (...args) => api('post', ...args),
  put: (...args) => api('put', ...args),
  patch: (...args) => api('patch', ...args),
  delete: (...args) => api('delete', ...args),
};
