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

export const priceFormatter = (number) => {
  // Handle non-numeric input
  if (isNaN(number)) {
    return '';
  }

  const parts = number.toFixed(2).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const decimalPart = parts[1] ? `.${parts[1]}` : '';

  return `${integerPart}${decimalPart}`;
};
