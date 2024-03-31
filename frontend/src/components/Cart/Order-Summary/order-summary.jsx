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

  return (
    <div className="order-summary">
      <div className="order-summary__price">
        <span className="order-heading">Order Total: </span>
        <span className="total-price">₹{getOrderTotal()}</span>
      </div>
      <div className="gift-checkbox">
        <input type="checkbox" />
        <div>This order contains a gift</div>
      </div>
      <button className="action-btn btn-lg checkout-btn">Proceed to checkout</button>
    </div>
  );
};

export default OrderSummary;
