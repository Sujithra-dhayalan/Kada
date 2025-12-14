import React, { useState, useCallback } from 'react';

export const CartContext = React.createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = useCallback((sweet) => {
    setCartItems(prev => {
      const existing = prev.find(item => item._id === sweet._id);
      if (existing) {
        return prev.map(item =>
          item._id === sweet._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...sweet, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((sweetId) => {
    setCartItems(prev => prev.filter(item => item._id !== sweetId));
  }, []);

  const updateQuantity = useCallback((sweetId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(sweetId);
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item._id === sweetId ? { ...item, quantity } : item
        )
      );
    }
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalPrice,
      totalItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
