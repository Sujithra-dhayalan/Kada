import React, { useState, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const LoginForm = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.email || !form.password) {
      setError('Please provide email and password');
      return;
    }

    try {
      setLoading(true);
      console.log('[LoginForm] Submitting login');
      const res = await api.post('/auth/login', form);
      console.log('[LoginForm] Login response:', res.data);
      login(res.data.token);
      console.log('[LoginForm] login success, navigating to', from);
      // Navigate to the protected page immediately; `login` now sets `user` synchronously
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="card" style={{ width: 350 }}>
        <h2 style={{ textAlign: 'center', color: 'var(--primary-color)' }}>Welcome back</h2>

        {error && (
          <div style={{ color: 'var(--danger)', marginBottom: 8 }}>{error}</div>
        )}

        <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="Email" className="input-field" />

        <input name="password" value={form.password} onChange={handleChange} type="password" placeholder="Password" className="input-field" />

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <small style={{ color: 'var(--text-light)' }}>
            Don't have an account? <Link to="/register">Sign up</Link>
          </small>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
