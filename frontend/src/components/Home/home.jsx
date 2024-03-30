import React from 'react';
import ProductList from '../../shared/components/Product/Product-List/product-list';
import Header from '../../shared/components/Header/header';
import { APP_PAGES } from '../../shared/constants/app-constants';
import './home.css';

const Home = () => {
  return (
    <>
      <Header />
      <div className="header-above">
        <div className="four-pm-branding banner-text">`Get it delivered by 4 PM.`</div>
        <ProductList page={APP_PAGES.HOME} />
      </div>
    </>
  );
};

export default Home;
