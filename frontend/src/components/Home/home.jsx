import React from 'react';
import ProductList from '../../shared/components/Product/Product-List/product-list';
import Header from '../../shared/components/Header/header';
import { APP_PAGES } from '../../shared/constants/app-constants';
import './home.css';
import Banner from '../../shared/components/Banner/banner';

const Home = () => {
  return (
    <>
      <Header />
      <Banner />
      <div className="body-margin">
        <ProductList page={APP_PAGES.HOME} />
      </div>
    </>
  );
};

export default Home;
