import { useCart } from '../../../contexts/cart-context';
import './product-card.css';

const ProductCard = ({ product }) => {
  const { imgSrc, name, price } = product;
  const { addToCart } = useCart();

  const addItemToCart = () => {
    addToCart(product);
  };

  const numberFormatter = (number) => {
    if (isNaN(number)) {
      return ''; // Handle non-numeric input
    }

    const parts = number.toFixed(2).split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const decimalPart = parts[1] ? `.${parts[1]}` : '';

    return `${integerPart}${decimalPart}`;
  };

  return (
    <div className="product-card ">
      <img className="non-selectable" src={imgSrc} alt={name} />
      <h4>{name.length > 50 ? `${name.substr(0, 60)}...` : name}</h4>
      <p className="price">₹{numberFormatter(price)}</p>
      <button className="non-selectable" onClick={addItemToCart}>
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
