import { ToastContainer, toast } from 'react-toastify';
import { getDiscountCode } from '../../../shared/Services/Order/order-service';
import { priceFormatter } from '../../../shared/Services/Product/product-service';
import { useCart } from '../../../shared/contexts/cart-context';
import './order-summary.css';
import { useState } from 'react';
import Spinner from '../../../shared/components/Loader/loader';

const OrderSummary = () => {
  const { cart } = useCart();
  const [discountCode, setDiscountCode] = useState('');
  const [discountValueString, setDiscountValueString] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const getOrderTotalINR = () => {
    const orderTotal = cart.reduce((total, item) => {
      return total + item.quantity * item.price;
    }, 0);

    return priceFormatter(orderTotal);
  };

  const getOrderTotalFloat = () => {
    return cart.reduce((total, item) => {
      return total + item.quantity * item.price;
    }, 0);
  };

  const requestDiscountCode = () => {
    if (discountCode) {
      toast.info('Existing discount code found');
      return;
    }
    setIsLoading(true);
    getDiscountCode()
      .then((result) => {
        if (result.discountCode) {
          setDiscountCode(result.discountCode);
          setDiscountValueString(result.discountValue);
          setDiscountPercent(result.discountPercent);
          toast.success(`Yay! You got ${result.discountValue} discount`);
          return;
        } else {
          toast('🤷‍♂️ No discount code found');
        }
      })
      .catch((error) => {
        console.error(error);
        toast.warn('Error occured. Please try again later');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="order-summary">
      {discountCode ? (
        <>
          <div className="order-summary__price updated-price">
            <div>
              <span className="order-heading">Updated Total: </span>
              <span className="total-price">
                {priceFormatter(getOrderTotalFloat() * ((100 - discountPercent) / 100))}
              </span>
            </div>
            <div className="discount-string"> ({discountValueString} discount applied!)</div>
          </div>
        </>
      ) : (
        <div className="order-summary__price">
          <span className="order-heading">Order Total: </span>
          <span className="total-price">{getOrderTotalINR()}</span>
        </div>
      )}
      <div className="gift-checkbox">
        <input type="checkbox" />
        <div>This order contains a gift</div>
      </div>
      <div className="order-contents">
        {cart.map((item) => (
          <div className="order-contents__item">
            <div>{item.name.substr(0, 57).trim()}... </div>
            <div>x{item.quantity}</div>
            <div style={{ color: '#007c00' }}>{priceFormatter(item.quantity * item.price)}</div>
          </div>
        ))}
      </div>

      <div className="summary-button-container">
        <div>
          <button
            disabled={discountCode}
            onClick={requestDiscountCode}
            className={`action-btn btn-lg summary-action-btn ${
              discountCode ? 'action-btn__disabled btn-lg summary-action-btn' : ''
            }`}
          >
            Get discount code
          </button>
        </div>
        <div>
          <button className="action-btn btn-lg summary-action-btn">Proceed to checkout</button>
        </div>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={true}
        limit={1}
        theme="dark"
      />
      <Spinner showSpinner={isLoading} />
    </div>
  );
};

export default OrderSummary;
