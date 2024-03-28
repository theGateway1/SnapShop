import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setCurrentUser } from '../Services/Auth/auth-service';

export const AuthContext = React.createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = (props) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const contextValue = {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
  };

  // Automatically login the user, and redirect to the path user tried to access
  useEffect(() => {
    let currentUserInfo = localStorage.getItem('currentUser');
    if (currentUserInfo) {
      currentUserInfo = JSON.parse(currentUserInfo);
      setUser(currentUserInfo);
      setCurrentUser(currentUserInfo);
      setIsAuthenticated(true);
      navigate(props.path);
    }
  }, []);

  return <AuthContext.Provider value={contextValue}>{props.children}</AuthContext.Provider>;
};
