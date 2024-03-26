import api from '../../utils/api';

export const getProducts = (page) => {
  return new Promise((resolve, reject) => {
    api
      .get('/product/get-products/' + page)
      .then((products) => {
        resolve(products);
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
};
