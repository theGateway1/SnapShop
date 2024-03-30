import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './auth.css';
import { loginUser } from '../../shared/Services/Auth/auth-service';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../shared/contexts/auth-context';
import Spinner from '../../shared/components/Loader/loader';

const Auth = (props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginDisabled, setLoginDisabled] = useState(false);
  const { setUser, setIsAuthenticated, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Auth context will try to login user automatically, if that succeeds, redirect user to home page
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  });

  const loginButtonClicked = async () => {
    // Set initial error values to empty
    setEmailError('');
    setPasswordError('');

    // Remove older toasts
    toast.dismiss();

    // Check if the user has entered both fields correctly
    if (!email?.length) {
      setEmailError('Please enter your email');
      return;
    }

    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setEmailError('Please enter a valid email');
      return;
    }

    if (!password?.length) {
      setPasswordError('Please enter a password');
      return;
    }

    if (password.length < 7) {
      setPasswordError('The password must be 7 characters or longer');
      return;
    }

    setLoginDisabled(true);
    loginUser(email, password)
      .then((loggedInUser) => {
        setLoginDisabled(false);
        setUser(loggedInUser);
        setIsAuthenticated(true);
        navigate('/');
      })
      .catch((error) => {
        setLoginDisabled(false);
        toast.error('Invalid credentials');
      });
  };

  return (
    <>
      <div className={'mainContainer'}>
        <div className={'titleContainer'}>
          <img
            className="banner-image non-selectable"
            src={require('../../shared/assets/images/4pm.jpg')}
          />
          <div className="heading">The 4PM Store</div>
        </div>
        <br />
        <div className={'inputContainer'}>
          <input
            type="email"
            value={email}
            placeholder="Email"
            onChange={(ev) => setEmail(ev.target.value)}
            className={'inputBox'}
          />
          <label className="errorLabel">{emailError}</label>
        </div>
        <br />
        <div className={'inputContainer'}>
          <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(ev) => setPassword(ev.target.value)}
            className={'inputBox'}
          />

          <label className="errorLabel">{passwordError}</label>
        </div>
        <br />
        <button
          type="button"
          className={`action-btn ${loginDisabled ? 'action-btn__disabled' : ''}`}
          disabled={loginDisabled}
          onClick={loginButtonClicked}
        >
          Log in
        </button>
        <ToastContainer
          position="top-center"
          autoClose={1000}
          hideProgressBar={true}
          limit={1}
          theme="dark"
        />
        <Spinner showSpinner={loginDisabled} />
      </div>
    </>
  );
};

export default Auth;
