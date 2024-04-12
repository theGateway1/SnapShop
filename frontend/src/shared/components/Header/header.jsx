import './header.css';
import { getUserName } from '../../Services/Auth/auth-service';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/auth-context';
import { ToastContainer, toast } from 'react-toastify';
import { useCart } from '../../contexts/cart-context';
import { useState } from 'react';

const Header = () => {
  const userName = getUserName();
  const navigate = useNavigate();
  const { setIsAuthenticated, setUser } = useAuth();
  const { cart } = useCart();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { resetCart } = useCart();

  const openCart = () => {
    navigate('/cart');
  };

  const logUserOut = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    setIsAuthenticated(false);
    resetCart();
  };

  const navigateToHome = () => {
    navigate('/');
  };

  const greetUser = () => {
    // toast(You are signed in as ${getUserName()});
  };

  return (
    <>
      <header className="header">
        <div className="header-content">
          <div onClick={navigateToHome} className="header-content-left">
            <img
              className="header-image non-selectable"
              src={require('../../assets/images/4pm.jpg')}
            />
            <p className="four-pm-branding">The 4PM Store</p>
          </div>

          <div className="header-content-right lg-only non-selectable">
            <p onClick={greetUser}>{userName}</p>
            {!cart.length ? (
              <p onClick={openCart}>Cart</p>
            ) : (
              <div className="cart-with-count">
                <div className="item-count">{cart.length}</div>
                <p onClick={openCart}>Cart</p>
              </div>
            )}
            <p onClick={logUserOut}>Logout</p>
          </div>
        </div>
      </header>
      <div className="footer mb-only non-selectable">
        <p onClick={greetUser}>{userName}</p>
        {!cart.length ? (
          <p onClick={openCart}>Cart 🛒</p>
        ) : (
          <div className="cart-with-count">
            <div className="item-count-mb">{cart.length}</div>
            <p onClick={openCart}>Cart 🛒</p>
          </div>
        )}
        <p onClick={logUserOut}>Logout</p>
      </div>
      <ToastContainer position="top-center" hideProgressBar={true} limit={1} theme="light" />
    </>
  );
};

export default Header;
