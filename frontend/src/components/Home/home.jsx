import React, { useEffect, useState } from 'react';
import { useCart } from '../../shared/contexts/cart-context';
import { getProducts } from '../../shared/Services/Product/product-service';
import Spinner from '../../shared/components/Loader/loader';
import { ErrorScreen } from '../../shared/components/Error-Screen/error-screen';

const Home = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorOccured, setErrorOccured] = useState(false);
  const { products, setProducts, addToCart, removeFromCart, changeQuantity } = useCart();

  useEffect(() => {
    setIsLoading(true);
    getProducts()
      .then((productsList) => {
        setProducts(productsList);
      })
      .catch((error) => {
        setErrorOccured(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <>
      {errorOccured && !isLoading ? (
        <ErrorScreen errorMessage={'Failed to load products. Please try again later.'}></ErrorScreen>
      ) : !isLoading ? (
        <div className="mainContainer">
          <div className={'titleContainer'}>
            <div>Welcome!</div>
          </div>
          <div>This is the home page.</div>
        </div>
      ) : (
        <></>
      )}
      <Spinner showSpinner={isLoading} />
    </>
  );
};

export default Home;
