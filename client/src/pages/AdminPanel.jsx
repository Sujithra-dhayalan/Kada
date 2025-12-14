import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: '', price: '', quantity: '', description: '' });

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="container">
        <Header />
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--danger)' }}>
          <h2>Access Denied</h2>
          <p>You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchSweets();
  }, []);

  const fetchSweets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sweets');
      setSweets(res.data);
    } catch (err) {
      addToast('Failed to load sweets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update sweet
        await api.put(`/sweets/${editingId}`, {
          ...formData,
          price: Number(formData.price),
          quantity: Number(formData.quantity)
        });
        addToast('Sweet updated successfully', 'success');
      } else {
        // Add new sweet
        await api.post('/sweets', {
          ...formData,
          price: Number(formData.price),
          quantity: Number(formData.quantity)
        });
        addToast('Sweet added successfully', 'success');
      }
      setFormData({ name: '', category: '', price: '', quantity: '', description: '' });
      setEditingId(null);
      fetchSweets();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to save sweet', 'error');
    }
  };

  const handleEdit = (sweet) => {
    setFormData({
      name: sweet.name,
      category: sweet.category,
      price: sweet.price,
      quantity: sweet.quantity,
      description: sweet.description || ''
    });
    setEditingId(sweet._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sweet?')) {
      try {
        await api.delete(`/sweets/${id}`);
        addToast('Sweet deleted successfully', 'success');
        fetchSweets();
      } catch (err) {
        addToast('Failed to delete sweet', 'error');
      }
    }
  };

  const handleRestock = async (id) => {
    const amount = prompt('Enter restock amount:', '5');
    if (amount) {
      try {
        await api.post(`/sweets/${id}/restock`, { amount: Number(amount) });
        addToast('Sweet restocked successfully', 'success');
        fetchSweets();
      } catch (err) {
        addToast('Failed to restock sweet', 'error');
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', category: '', price: '', quantity: '', description: '' });
    setEditingId(null);
  };

  return (
    <div className="container">
      <Header />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="header-title" style={{ margin: 0 }}>Admin Panel</h1>
        <button onClick={() => navigate('/')} className="btn" style={{ padding: '8px 16px', fontSize: 14 }}>
          ← Back to Shop
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
        {/* Form */}
        <div style={{ padding: 20, backgroundColor: 'var(--card-bg)', borderRadius: 8, boxShadow: 'var(--shadow)' }}>
          <h3 style={{ marginTop: 0, color: 'var(--primary-color)' }}>
            {editingId ? 'Edit Sweet' : 'Add New Sweet'}
          </h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Sweet name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              required
            />
            <input
              type="text"
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleChange}
              className="input-field"
              required
            />
            <input
              type="number"
              name="price"
              placeholder="Price ($)"
              value={formData.price}
              onChange={handleChange}
              className="input-field"
              step="0.01"
              required
            />
            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="input-field"
              required
            />
            <textarea
              name="description"
              placeholder="Description (optional)"
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              rows="3"
              style={{ resize: 'none' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn" style={{ flex: 1 }}>
                {editingId ? 'Update' : 'Add'} Sweet
              </button>
              {editingId && (
                <button type="button" onClick={handleCancel} className="btn" style={{ flex: 1, backgroundColor: 'var(--text-light)' }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Sweets List */}
        <div style={{ padding: 20, backgroundColor: 'var(--card-bg)', borderRadius: 8, boxShadow: 'var(--shadow)' }}>
          <h3 style={{ marginTop: 0, color: 'var(--primary-color)' }}>Sweets Inventory</h3>
          {loading ? (
            <div>Loading...</div>
          ) : sweets.length === 0 ? (
            <div style={{ color: 'var(--text-light)' }}>No sweets yet. Add one!</div>
          ) : (
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {sweets.map(sweet => (
                <div key={sweet._id} style={{ padding: 10, borderBottom: '1px solid #e5e7eb', marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <strong>{sweet.name}</strong>
                      <p style={{ margin: '2px 0', color: 'var(--text-light)', fontSize: 12 }}>
                        {sweet.category} | ${sweet.price} | Stock: {sweet.quantity}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => handleEdit(sweet)}
                        style={{
                          padding: '4px 8px',
                          fontSize: 12,
                          backgroundColor: 'var(--primary-color)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRestock(sweet._id)}
                        style={{
                          padding: '4px 8px',
                          fontSize: 12,
                          backgroundColor: 'var(--success)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer'
                        }}
                      >
                        Stock
                      </button>
                      <button
                        onClick={() => handleDelete(sweet._id)}
                        style={{
                          padding: '4px 8px',
                          fontSize: 12,
                          backgroundColor: 'var(--danger)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer'
                        }}
                      >
                        Del
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
