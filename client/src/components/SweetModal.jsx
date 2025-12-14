import React from 'react';

const SweetModal = ({ sweet, onClose, onBuy }) => {
  if (!sweet) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'var(--card-bg)',
        padding: 30,
        borderRadius: 8,
        maxWidth: 500,
        width: '90%',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        position: 'relative'
      }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'none',
          border: 'none',
          fontSize: 24,
          cursor: 'pointer',
          color: 'var(--text-light)'
        }}>
          ✕
        </button>

        <h2 style={{ color: 'var(--primary-color)', marginTop: 0 }}>{sweet.name}</h2>

        <div style={{ marginBottom: 15 }}>
          <p style={{ margin: '5px 0', color: 'var(--text-light)' }}>
            <strong>Category:</strong> {sweet.category}
          </p>
          <p style={{ margin: '5px 0', fontSize: 20, fontWeight: 'bold', color: 'var(--success)' }}>
            ${sweet.price}
          </p>
          <p style={{ margin: '5px 0', color: 'var(--text-light)' }}>
            <strong>In Stock:</strong> {sweet.quantity} {sweet.quantity === 1 ? 'item' : 'items'}
          </p>
        </div>

        {sweet.description && (
          <div style={{ marginBottom: 20, padding: 10, backgroundColor: 'var(--bg-color)', borderRadius: 4 }}>
            <p style={{ margin: 0, color: 'var(--text-dark)' }}>{sweet.description}</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => {
              onBuy(sweet._id);
              onClose();
            }}
            disabled={sweet.quantity === 0}
            className="btn"
            style={{ flex: 1 }}
          >
            {sweet.quantity === 0 ? 'Out of Stock' : 'Buy Now'}
          </button>
          <button onClick={onClose} className="btn" style={{ flex: 1, backgroundColor: 'var(--text-light)' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SweetModal;
