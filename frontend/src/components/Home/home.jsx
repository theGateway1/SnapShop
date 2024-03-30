import React from 'react';
import ProductList from '../../shared/components/Product/Product-List/product-list';
import Header from '../../shared/components/Header/header';
import { APP_PAGES } from '../../shared/constants/app-constants';

const Home = () => {
  return (
    <>
      <Header />
      <div className="header-above">
        <ProductList page={APP_PAGES.HOME} />
      </div>
    </>
  );
};

export default Home;
