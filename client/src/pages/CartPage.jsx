import React from 'react';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalPrice, totalItems } = useCart();
  const { addToast } = useToast();
  const [processing, setProcessing] = React.useState(false);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      addToast('Cart is empty', 'warning');
      return;
    }

    try {
      setProcessing(true);
      // Purchase each item in the cart
      for (const item of cartItems) {
        for (let i = 0; i < item.quantity; i++) {
          await api.post(`/sweets/${item._id}/purchase`);
        }
      }
      addToast(`Successfully purchased ${totalItems} item(s)!`, 'success');
      clearCart();
    } catch (err) {
      addToast(err.response?.data?.error || 'Checkout failed', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container">
      <Header />
      <h1 className="header-title">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>
          <p style={{ fontSize: 18 }}>Your cart is empty. Start shopping!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          {/* Cart Items */}
          <div>
            {cartItems.map(item => (
              <div key={item._id} style={{
                padding: 15,
                marginBottom: 10,
                backgroundColor: 'var(--card-bg)',
                borderRadius: 8,
                boxShadow: 'var(--shadow)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, color: 'var(--primary-color)' }}>{item.name}</h4>
                  <p style={{ margin: '4px 0', color: 'var(--text-light)', fontSize: 14 }}>
                    {item.category} | ${item.price} each
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    style={{
                      width: 30,
                      height: 30,
                      border: '1px solid #d1d5db',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      borderRadius: 4
                    }}
                  >
                    −
                  </button>

                  <span style={{ minWidth: 40, textAlign: 'center', fontWeight: 'bold' }}>
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    disabled={item.quantity >= item.quantity}
                    style={{
                      width: 30,
                      height: 30,
                      border: '1px solid #d1d5db',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      borderRadius: 4,
                      opacity: item.quantity >= item.quantity ? 0.5 : 1
                    }}
                  >
                    +
                  </button>

                  <span style={{ minWidth: 70, textAlign: 'right', fontWeight: 'bold', color: 'var(--success)' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>

                  <button
                    onClick={() => removeFromCart(item._id)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'var(--danger)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 12
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div style={{
            padding: 20,
            backgroundColor: 'var(--card-bg)',
            borderRadius: 8,
            boxShadow: 'var(--shadow)',
            height: 'fit-content'
          }}>
            <h3 style={{ marginTop: 0, color: 'var(--primary-color)' }}>Order Summary</h3>

            <div style={{ marginBottom: 15 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>Items: {totalItems}</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 'bold', padding: 10, backgroundColor: 'var(--bg-color)', borderRadius: 4, textAlign: 'right' }}>
                Total: <span style={{ color: 'var(--success)' }}>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={processing || cartItems.length === 0}
              className="btn"
              style={{ width: '100%', marginBottom: 8 }}
            >
              {processing ? 'Processing...' : 'Checkout'}
            </button>

            <button
              onClick={clearCart}
              className="btn"
              style={{ width: '100%', backgroundColor: 'var(--text-light)' }}
            >
              Clear Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
