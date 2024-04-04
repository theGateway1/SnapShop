import './cart.css';
import Header from '../../../shared/components/Header/header';
import Spinner from '../../../shared/components/Loader/loader';
import { useCart } from '../../../shared/contexts/cart-context';
import { ErrorScreen } from '../../../shared/components/Error-Screen/error-screen';
import { useState } from 'react';
import ProductList from '../../../shared/components/Product/Product-List/product-list';
import { APP_PAGES } from '../../../shared/constants/app-constants';
import Banner from '../../../shared/components/Banner/banner';
import OrderSummary from '../Order-Summary/order-summary';

const Cart = () => {
  const { cart } = useCart();

  const [isLoading, setIsLoading] = useState(false);
  const [errorOccured, setErrorOccured] = useState(false);
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);

  return (
    <>
      <Header />
      {!cart.length ? (
        <ErrorScreen errorMessage={'Your cart is empty 🤷‍♂️'}></ErrorScreen>
      ) : (
        <>
          <Banner addedClass="banner-container" />
          <div
            className={`body-margin cart-summary-wrapper ${
              invoiceGenerated ? 'cart-summary-wrapper__payment' : ''
            }`}
          >
            {invoiceGenerated ? (
              <></>
            ) : (
              <div className="cart-items">
                <div className="cart-heading">Review Items</div>
                <ProductList page={APP_PAGES.CART} />
              </div>
            )}
            <div className="cart-order-summary">
              <div className={`cart-heading ${invoiceGenerated ? 'payment-heading' : ''}`}>
                {invoiceGenerated ? 'Make Payment' : 'Cart Summary'}
              </div>
              <div className="cart-order-summary__container">
                <OrderSummary
                  invoiceGenerated={invoiceGenerated}
                  setInvoiceGenerated={setInvoiceGenerated}
                />
              </div>
            </div>
          </div>
        </>
      )}
      <Spinner showSpinner={isLoading} />
    </>
  );
};

export default Cart;
