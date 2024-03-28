import './cart.css';
import { getUserName } from '../../shared/Services/Auth/auth-service';
import Header from '../../shared/components/Header/header';

const Cart = () => {
  const userName = getUserName();

  return (
    <>
      <Header />
      <h3 className="header-above">{userName}'s Cart</h3>
    </>
  );
};

export default Cart;
