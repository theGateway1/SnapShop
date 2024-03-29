import React, { useState, useContext } from 'react';

const CartContext = React.createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  // Helper functions to update items in cart
  const addToCart = (product) => {
    setCart([...cart, { ...product, quantity: 1 }]);
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item._id !== productId);
    setCart(updatedCart);
  };

  const changeQuantity = (product, newQuantity) => {
    const updatedCart = cart.map((item) =>
      item._id === product._id ? { ...item, quantity: newQuantity } : item,
    );

    setCart(updatedCart);
  };

  const contextValue = {
    products,
    setProducts,
    cart,
    addToCart,
    removeFromCart,
    changeQuantity,
  };

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};
