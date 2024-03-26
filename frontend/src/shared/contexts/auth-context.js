import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setCurrentUser } from '../Services/Auth/auth-service';

export const AuthContext = React.createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const contextValue = {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
  };

  useEffect(() => {
    let currentUserInfo = localStorage.getItem('currentUser');
    if (currentUserInfo) {
      currentUserInfo = JSON.parse(currentUserInfo);
      setUser(currentUserInfo);
      setCurrentUser(currentUserInfo);
      setIsAuthenticated(true);
      navigate('/');
    }
  }, []);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
