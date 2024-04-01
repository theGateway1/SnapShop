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

export const createOrderInvoice = (itemsList, discountCode) => {
  return new Promise((resolve, reject) => {
    api
      .post('/order/create-order-invoice', { itemsList, discountCode })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
};
