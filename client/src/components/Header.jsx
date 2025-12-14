import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <h2 style={{ color: 'var(--primary-color)', margin: 0, cursor: 'pointer' }} onClick={() => navigate('/')}>
        🍬 Sweet Shop
      </h2>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {user && <span style={{ color: 'var(--text-light)', fontSize: 14 }}>Role: {user.role || 'user'}</span>}
        <button className="btn" onClick={() => navigate('/history')} style={{ backgroundColor: 'var(--text-light)', padding: '8px 12px', fontSize: 14 }}>
          History
        </button>
        {user?.role === 'admin' && (
          <button className="btn" onClick={() => navigate('/admin')} style={{ backgroundColor: 'var(--primary-color)', padding: '8px 12px', fontSize: 14 }}>
            Admin
          </button>
        )}
        <button className="btn" onClick={logout} style={{ padding: '8px 12px', fontSize: 14 }}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
