import React, { useState, useContext } from 'react';

const CartContext = React.createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  // Helper functions to update items in cart
  const addToCart = (product) => {
    setCart([...cart, { ...product, quantity: 1 }]);
    const updatedProducts = products.map((item) =>
      item._id === product._id ? { ...item, quantity: 1 } : item,
    );
    setProducts(updatedProducts);
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item._id !== productId);
    const updatedProducts = products.map((item) =>
      item._id === productId ? { ...item, quantity: 0 } : item,
    );

    setCart(updatedCart);
    setProducts(updatedProducts);
  };

  const changeQuantity = (product, newQuantity) => {
    const updatedCart = cart.map((item) =>
      item._id === product._id ? { ...item, quantity: newQuantity } : item,
    );
    const updatedProducts = products.map((item) =>
      item._id === product._id ? { ...item, quantity: newQuantity } : item,
    );

    setCart(updatedCart);
    setProducts(updatedProducts);
  };

  const resetCart = () => {
    setCart([]);
    const updatedProducts = products.map((item) => {
      return { ...item, quantity: 0 };
    });
    setProducts(updatedProducts);
  };

  const contextValue = {
    products,
    setProducts,
    cart,
    addToCart,
    removeFromCart,
    changeQuantity,
    resetCart,
  };

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};
