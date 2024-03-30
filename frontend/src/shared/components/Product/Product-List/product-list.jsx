import { useEffect, useState } from 'react';
import { useCart } from '../../../contexts/cart-context';
import ProductCard from '../Product-Card/product-card';
import { getProducts } from '../../../Services/Product/product-service';
import Spinner from '../../Loader/loader';
import { ErrorScreen } from '../../Error-Screen/error-screen';
import './product-list.css';
import { APP_PAGES } from '../../../constants/app-constants';

const ProductList = ({ page }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorOccured, setErrorOccured] = useState(false);
  const { products, setProducts, cart } = useCart();

  useEffect(() => {
    if (page === APP_PAGES.HOME) {
      setIsLoading(true);
      const page = 1;

      getProducts(page)
        .then((productsList) => {
          setProducts(productsList);
        })
        .catch((error) => {
          setErrorOccured(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  return (
    <>
      {errorOccured && !isLoading ? (
        <ErrorScreen errorMessage={'Failed to load products'}></ErrorScreen>
      ) : !isLoading ? (
        page === APP_PAGES.HOME ? (
          <div>
            <ul className="product-grid">
              {products.map((product) => (
                <li key={product._id}>
                  <ProductCard page={page} product={product} />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div>
            <ul className="product-list">
              {cart.map((product) => (
                <li key={product._id}>
                  <ProductCard page={page} product={product} />
                </li>
              ))}
            </ul>
          </div>
        )
      ) : (
        <></>
      )}
      <Spinner showSpinner={isLoading} />
    </>
  );
};

export default ProductList;
