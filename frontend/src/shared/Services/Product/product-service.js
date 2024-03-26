import api from '../../utils/api';

export const getProducts = () => {
  return new Promise((resolve, reject) => {
    api
      .get('/product/get-products')
      .then((products) => {
        resolve(products);
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
};
