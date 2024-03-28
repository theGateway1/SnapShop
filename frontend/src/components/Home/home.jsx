import React from 'react';
import ProductList from '../../shared/components/Product/Product-List/product-list';
import Header from '../../shared/components/Header/header';

const Home = () => {
  return (
    <>
      <Header />
      <div className="header-above">
        <ProductList />
      </div>
    </>
  );
};

export default Home;
