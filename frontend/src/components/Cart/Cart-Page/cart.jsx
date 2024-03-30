import './cart.css';
import Header from '../../../shared/components/Header/header';
import Spinner from '../../../shared/components/Loader/loader';
import { useCart } from '../../../shared/contexts/cart-context';
import { ErrorScreen } from '../../../shared/components/Error-Screen/error-screen';
import { useState } from 'react';
import CartItemsList from '../Cart-Items-List/cart-items-list';

const Cart = () => {
  const { cart } = useCart();

  const [isLoading, setIsLoading] = useState(false);
  const [errorOccured, setErrorOccured] = useState(false);

  return (
    <>
      <Header />
      {!cart.length ? (
        <ErrorScreen errorMessage={'Your cart is empty 🤷‍♂️'}></ErrorScreen>
      ) : (
        <>
          <div className="header-above">
            <CartItemsList />
          </div>
        </>
      )}
      <Spinner showSpinner={isLoading} />
    </>
  );
};

export default Cart;
