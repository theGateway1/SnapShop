import { useEffect, useState } from 'react';
import { useCart } from '../../../contexts/cart-context';
import ProductCard from '../Product-Card/product-card';
import { getProducts } from '../../../Services/Product/product-service';
import Spinner from '../../Loader/loader';
import { ErrorScreen } from '../../Error-Screen/error-screen';
import './product-list.css';

const ProductList = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorOccured, setErrorOccured] = useState(false);
  const { products, setProducts, addToCart, removeFromCart, changeQuantity } = useCart();

  useEffect(() => {
    setIsLoading(true);
    const page = 1;
    getProducts(page)
      .then((productsList) => {
        console.log('Pd', productsList);
        setProducts(productsList);
      })
      .catch((error) => {
        console.log('E', error);
        setErrorOccured(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <>
      {errorOccured && !isLoading ? (
        <ErrorScreen errorMessage={'Failed to load products'}></ErrorScreen>
      ) : !isLoading ? (
        <div>
          <ul className="product-grid">
            {products.map((product) => (
              <li key={product._id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <></>
      )}
      <Spinner showSpinner={isLoading} />
    </>
  );
};

export default ProductList;
