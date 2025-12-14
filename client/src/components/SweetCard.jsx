import React from 'react';

const SweetCard = ({ sweet, onBuy }) => {
  return (
    <div className="sweet-card">
      <div>
        <h3 style={{ margin: 0 }}>{sweet.name}</h3>
        <p style={{ color: 'var(--text-light)', margin: 0 }}>{sweet.category}</p>
      </div>

      <div className="sweet-info">
        <span className="price">${sweet.price}</span>
        <span className={`badge ${sweet.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
          {sweet.quantity > 0 ? `${sweet.quantity} left` : 'Sold Out'}
        </span>
      </div>

      <button
        onClick={() => onBuy(sweet._id)}
        disabled={sweet.quantity === 0}
        className="btn"
      >
        {sweet.quantity === 0 ? 'Sold Out' : 'Buy Now'}
      </button>
    </div>
  );
};

export default SweetCard;
