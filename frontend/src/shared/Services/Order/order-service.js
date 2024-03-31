import api from '../../utils/api';

export const getDiscountCode = () => {
  return new Promise((resolve, reject) => {
    api
      .get('/order/request-discount-code')
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
};
