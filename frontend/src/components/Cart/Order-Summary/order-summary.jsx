import { ToastContainer, toast } from 'react-toastify';
import { getDiscountCode } from '../../../shared/Services/Order/order-service';
import { priceFormatter } from '../../../shared/Services/Product/product-service';
import { useCart } from '../../../shared/contexts/cart-context';
import './order-summary.css';

const OrderSummary = () => {
  const { cart } = useCart();

  const getOrderTotal = () => {
    const orderTotal = cart.reduce((total, item) => {
      return total + item.quantity * item.price;
    }, 0);

    return priceFormatter(orderTotal);
  };

  const requestDiscountCode = () => {
    getDiscountCode()
      .then((result) => {
        if (result.discountCode) {
          toast.success(`Yay! You got ${result.discountValue} discount`);
          return;
        } else {
          toast('🤷‍♂️ No discount code found');
        }
      })
      .catch((error) => {
        console.error(error);
        toast.warn('Error occured. Please try again later');
      });
  };

  return (
    <div className="order-summary">
      <div className="order-summary__price">
        <span className="order-heading">Order Total: </span>
        <span className="total-price">{getOrderTotal()}</span>
      </div>
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
          <button onClick={requestDiscountCode} className="action-btn btn-lg summary-action-btn">
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
    </div>
  );
};

export default OrderSummary;
