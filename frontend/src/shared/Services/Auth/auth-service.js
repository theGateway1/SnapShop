import api from '../../utils/api';

var currentUser;
export const getUserAuthToken = () => {
  if (currentUser) {
    return currentUser.authToken;
  }
};

export const setCurrentUser = (loggedInUser) => {
  currentUser = loggedInUser;
};

export const getUserName = () => {
  if (currentUser) {
    return currentUser.firstName + ' ' + currentUser.lastName;
  }
};

export const loginUser = (email, password) => {
  return new Promise((resolve, reject) => {
    api
      .post(`/auth/user-login`, { email, password })
      .then((loggedInUser) => {
        currentUser = loggedInUser;

        // Store user's non-sensitive details in browser storage for automatic login
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        resolve(loggedInUser);
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
};
