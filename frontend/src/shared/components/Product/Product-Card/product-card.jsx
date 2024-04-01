import { useEffect, useState } from 'react';
import { useCart } from '../../../contexts/cart-context';
import './product-card.css';
import { ToastContainer, toast } from 'react-toastify';
import { APP_PAGES } from '../../../constants/app-constants';
import { priceFormatter } from '../../../Services/Product/product-service';

const ProductCard = ({ product, page }) => {
  const { imgSrc, name, price, quantity } = product;
  const { addToCart, changeQuantity, removeFromCart } = useCart();
  const [itemQtyInCart, setItemQtyInCart] = useState(quantity);
  const [userUpdatedItemQty, setUserUpdatedItemQty] = useState(false);
  var toastId;

  // Use useEffect hook to update quantity in cart as state variable changes
  useEffect(() => {
    // Prevent from running when component mounts
    if (!userUpdatedItemQty) {
      return;
    } else if (!itemQtyInCart) {
      removeFromCart(product._id);
    } else {
      changeQuantity(product, itemQtyInCart);
    }
  }, [itemQtyInCart]);

  const addItemToCart = () => {
    setUserUpdatedItemQty(true);
    setItemQtyInCart(1);
    addToCart(product);
  };

  const reduceItemQtyFromCart = () => {
    setUserUpdatedItemQty(true);
    setItemQtyInCart(itemQtyInCart - 1);
  };

  const addItemQtyToCart = () => {
    // Check if this item is available in stock, it is not real time, but gives a rough idea
    if (product.availableQty < itemQtyInCart + 1 || itemQtyInCart >= 1000) {
      // if (toastId) {
      //   toast.dismiss(toastId);
      // }
      toastId = toast("😓 Sorry, that's all we have for now.");
      return;
    }
    setUserUpdatedItemQty(true);
    setItemQtyInCart(itemQtyInCart + 1);
  };

  return (
    <>
      {page === APP_PAGES.HOME ? (
        <div className="product-card-home">
          <img className="non-selectable" src={imgSrc} alt={name} />
          <h4>{name.length > 50 ? `${name.substr(0, 60).trim()}...` : name}</h4>
          <p className="price">{priceFormatter(price)}</p>
          {!itemQtyInCart ? (
            <button type="button" className="action-btn btn-md" onClick={addItemToCart}>
              Add to cart
            </button>
          ) : (
            <div className="item-in-cart-options">
              <button
                type="button"
                className="action-btn btn-sm qty-btn"
                onClick={reduceItemQtyFromCart}
              >
                -
              </button>
              <div className="item-qty">{itemQtyInCart}</div>
              <button
                type="button"
                className="action-btn btn-sm qty-btn"
                onClick={addItemQtyToCart}
              >
                +
              </button>
            </div>
          )}
          <ToastContainer position="top-center" hideProgressBar={true} limit={1} theme="dark" />
        </div>
      ) : (
        <div className="product-card-cart">
          <div className="non-selectable cart-card-left">
            <img src={imgSrc} alt={name} />
          </div>
          <div className="cart-card-right">
            <p className="item-name">
              {name.length > 50 ? `${name.substr(0, 100).trim()}...` : name}
            </p>
            <p className="item-status">In Stock | Delivery: By 4 PM tomorrow</p>
            <div className="price-qty-container">
              <p className="price-cart">{'Price: ' + priceFormatter(price)}</p>

              <div className="item-in-cart-options">
                <button
                  type="button"
                  className="action-btn btn-sm qty-btn"
                  onClick={reduceItemQtyFromCart}
                >
                  -
                </button>
                <div className="item-qty">{itemQtyInCart}</div>
                <button
                  type="button"
                  className="action-btn btn-sm qty-btn"
                  onClick={addItemQtyToCart}
                >
                  +
                </button>
              </div>
            </div>

            <ToastContainer position="top-center" hideProgressBar={true} limit={1} theme="dark" />
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
