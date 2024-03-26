import React, { useState, useContext } from 'react';

const CartContext = React.createContext();
export const useCart = () => useContext(CartContext);

// Sample: To be removed later
const productsData = [
  { id: 1, name: 'Product 1', price: 10 },
  { id: 2, name: 'Product 2', price: 20 },
];

export const CartProvider = ({ children }) => {
  const [products, setProducts] = useState(productsData);
  const [cart, setCart] = useState([]);

  // Helper functions to update items in cart
  const addToCart = (productId) => {
    const productToAdd = products.find((product) => product.id === productId);
    setCart([...cart, { ...productToAdd, quantity: 1 }]);
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item.id !== productId);
    setCart(updatedCart);
  };

  const changeQuantity = (productId, newQuantity) => {
    const updatedCart = cart.map((item) =>
      item.id === productId ? { ...item, quantity: newQuantity } : item,
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
