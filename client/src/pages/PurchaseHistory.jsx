import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../utils/api';

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      // Assuming backend has a GET /api/purchases endpoint
      // If not, we'll need to create it on the server side
      const res = await api.get('/purchases');
      setPurchases(res.data || []);
    } catch (err) {
      console.error('Purchase history not available yet:', err);
      setError('Purchase history feature coming soon. Please check back later.');
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Header />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="header-title" style={{ margin: 0 }}>Purchase History</h1>
        <button onClick={() => navigate('/')} className="btn" style={{ padding: '8px 16px', fontSize: 14 }}>
          ← Back to Shop
        </button>
      </div>

      {loading && <div>Loading your purchases…</div>}
      {error && <div style={{ color: 'var(--danger)', padding: 10 }}>{error}</div>}

      {!loading && purchases.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-light)', padding: 20 }}>
          You haven't made any purchases yet. Visit the sweets shop!
        </div>
      )}

      {purchases.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: 'var(--card-bg)',
            borderRadius: 8,
            overflow: 'hidden'
          }}>
            <thead style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}>
              <tr>
                <th style={{ padding: 12, textAlign: 'left' }}>Sweet Name</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Category</th>
                <th style={{ padding: 12, textAlign: 'right' }}>Price</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: 12 }}>{p.sweetName || p.name}</td>
                  <td style={{ padding: 12 }}>{p.category}</td>
                  <td style={{ padding: 12, textAlign: 'right', color: 'var(--success)', fontWeight: 'bold' }}>
                    ${p.price}
                  </td>
                  <td style={{ padding: 12, color: 'var(--text-light)' }}>
                    {new Date(p.purchasedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {purchases.length > 0 && (
            <div style={{ marginTop: 20, padding: 15, backgroundColor: 'var(--bg-color)', borderRadius: 8, textAlign: 'right' }}>
              <strong>Total Spent: </strong>
              <span style={{ fontSize: 18, color: 'var(--success)', fontWeight: 'bold' }}>
                ${purchases.reduce((sum, p) => sum + p.price, 0).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;
