import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartProvider, useCart } from '../CartContext';
import { describe, it, expect } from 'vitest';

describe('CartContext', () => {
  const TestChild = () => {
    const { cartItems, addToCart, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice } = useCart();
    return (
      <div>
        <div data-testid="items">{JSON.stringify(cartItems)}</div>
        <div data-testid="totals">{totalItems}~{totalPrice}</div>
        <button onClick={() => addToCart({ _id: 's1', price: 5 })}>add</button>
        <button onClick={() => addToCart({ _id: 's2', price: 2 })}>add2</button>
        <button onClick={() => updateQuantity('s1', 3)}>update</button>
        <button onClick={() => removeFromCart('s1')}>remove</button>
        <button onClick={() => clearCart()}>clear</button>
      </div>
    );
  };

  it('adds items and computes totals', () => {
    render(
      <CartProvider>
        <TestChild />
      </CartProvider>
    );

    // initially empty
    expect(screen.getByTestId('totals').textContent).toBe('0~0');

    // add first item
    fireEvent.click(screen.getByText('add'));
    expect(screen.getByTestId('totals').textContent).toBe('1~5');

    // add different item
    fireEvent.click(screen.getByText('add2'));
    expect(screen.getByTestId('totals').textContent).toBe('2~7');

    // increase quantity of s1 to 3
    fireEvent.click(screen.getByText('update'));
    expect(screen.getByTestId('totals').textContent).toBe('4~17');

    // remove s1
    fireEvent.click(screen.getByText('remove'));
    expect(screen.getByTestId('totals').textContent).toBe('1~2');

    // clear cart
    fireEvent.click(screen.getByText('clear'));
    expect(screen.getByTestId('totals').textContent).toBe('0~0');
  });
});
