import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const RegisterForm = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.email || !form.password || !form.username) {
      setError('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/register', form);
      setSuccess('Registration successful — redirecting to login...');
      setTimeout(() => navigate('/login'), 900);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="card" style={{ width: 350 }}>
        <h2 style={{ textAlign: 'center', color: 'var(--primary-color)' }}>Create account</h2>

        {error && <div style={{ color: 'var(--danger)', marginBottom: 8 }}>{error}</div>}
        {success && <div style={{ color: 'var(--success)', marginBottom: 8 }}>{success}</div>}

        <input name="username" value={form.username} onChange={handleChange} type="text" placeholder="Username" className="input-field" />
        <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="Email" className="input-field" />
        <input name="password" value={form.password} onChange={handleChange} type="password" placeholder="Password" className="input-field" />

        <button type="submit" className="btn" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
      </form>
    </div>
  );
};

export default RegisterForm;
