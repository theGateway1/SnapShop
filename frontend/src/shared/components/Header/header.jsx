import './header.css';
import { getUserName } from '../../Services/Auth/auth-service';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/auth-context';
import { ToastContainer, toast } from 'react-toastify';

const Header = () => {
  const userName = getUserName();
  const navigate = useNavigate();
  const { setIsAuthenticated, setUser } = useAuth();

  const openCart = () => {
    navigate('/cart');
  };

  const logUserOut = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    setIsAuthenticated(false);
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
          <p onClick={navigateToHome}>E-Commerce</p>
          <div className="header-content-right">
            <p onClick={greetUser}>{userName}</p>
            <p onClick={openCart}>Cart</p>
            <p onClick={logUserOut}>Logout</p>
          </div>
        </div>
      </header>
      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar={true}
        limit={1}
        theme="light"
      />
    </>
  );
};

export default Header;
