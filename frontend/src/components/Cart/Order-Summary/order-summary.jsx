import { ToastContainer, toast } from 'react-toastify';
import {
  createOrderInvoice,
  getDiscountCode,
  makePayment,
} from '../../../shared/Services/Order/order-service';
import { priceFormatter } from '../../../shared/Services/Product/product-service';
import { useCart } from '../../../shared/contexts/cart-context';
import './order-summary.css';
import { useState } from 'react';
import Spinner from '../../../shared/components/Loader/loader';
import { useNavigate } from 'react-router-dom';

const OrderSummary = ({ invoiceGenerated, setInvoiceGenerated }) => {
  const { cart, setCart, setProducts } = useCart();
  const [discountCode, setDiscountCode] = useState('');
  const [discountValueString, setDiscountValueString] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const navigate = useNavigate();

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

  const generateOrderInvoice = () => {
    setIsLoading(true);
    createOrderInvoice(cart, discountCode)
      .then((result) => {
        setOrderId(result.orderId);
        setInvoiceId(result.invoiceId);
        setInvoiceGenerated(true);

        // Updated cart contains updated item price, available quantity and other information updated by server
        if (result.updatedCart) {
          setCart(result.updatedCart);
        }

        // If user's order is nth order, then user will get it at the time of generating invoice
        if (result.discountCode) {
          setDiscountCode(result.discountCode);
          setDiscountValueString(result.discountValue);
          setDiscountPercent(result.discountPercent);
          toast.success(`Yay! You got ${result.discountValue} discount`);
          return;
        } else {
          toast.success('Invoice generated successfully');
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error('Error Occured!');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const makeOrderPayment = () => {
    setIsLoading(true);
    makePayment(orderId, invoiceId)
      .then((paymentSuccess) => {
        setCart([]);
        setProducts([]);
        toast.success('Order Confirmed!');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      })
      .catch((error) => {
        console.error(error);
        toast.error('Error Occured!');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <div className="order-summary">
        <div className="payment-heading">Order Invoice</div>
        {discountCode ? (
          <>
            <div className="order-summary__price updated-price">
              <div>
                <span className="order-heading">Discounted Total: </span>
                <span className="total-price order-contents__price">
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
              <div className="order-contents__price">
                {priceFormatter(item.quantity * item.price)}
              </div>
            </div>
          ))}
          {discountCode ? (
            <div className="order-contents__item order-contents__discount">
              <div>[{`${discountValueString} Discount Applied`}]</div>
              <div></div>
              <div>-{priceFormatter(getOrderTotalFloat() * (discountPercent / 100))}</div>
            </div>
          ) : (
            <></>
          )}
        </div>

        {invoiceGenerated ? (
          <div className="summary-button-container">
            <button onClick={makeOrderPayment} className="action-btn btn-lg summary-action-btn">
              Make Payment
            </button>
          </div>
        ) : (
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
              <button
                onClick={generateOrderInvoice}
                className="action-btn btn-lg summary-action-btn"
              >
                Generate Invoice
              </button>
            </div>
          </div>
        )}
        <ToastContainer position="top-center" hideProgressBar={true} limit={1} theme="dark" />
        <Spinner showSpinner={isLoading} />
      </div>
    </>
  );
};

export default OrderSummary;
