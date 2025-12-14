import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import Header from '../components/Header';
import SweetCard from '../components/SweetCard';
import SearchBar from '../components/SearchBar';
import SweetModal from '../components/SweetModal';
import { useToast } from '../context/ToastContext';

const Dashboard = () => {
  const [sweets, setSweets] = useState([]);
  const [filteredSweets, setFilteredSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSweet, setSelectedSweet] = useState(null);
  const { addToast } = useToast();

  const fetchSweets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sweets');
      setSweets(res.data);
      setFilteredSweets(res.data);
    } catch (err) {
      setError('Failed to load sweets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (filters) => {
    try {
      setLoading(true);
      // Build query string from filters
      const params = new URLSearchParams();
      if (filters.name) params.append('name', filters.name);
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

      const res = await api.get(`/sweets/search?${params.toString()}`);
      setFilteredSweets(res.data);
    } catch (err) {
      console.error('Search error:', err);
      // If search fails, fall back to filtering locally
      let results = sweets;
      if (filters.name) {
        results = results.filter(s => s.name.toLowerCase().includes(filters.name.toLowerCase()));
      }
      if (filters.category) {
        results = results.filter(s => s.category.toLowerCase().includes(filters.category.toLowerCase()));
      }
      if (filters.minPrice) {
        results = results.filter(s => s.price >= Number(filters.minPrice));
      }
      if (filters.maxPrice) {
        results = results.filter(s => s.price <= Number(filters.maxPrice));
      }
      setFilteredSweets(results);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (id) => {
    try {
      await api.post(`/sweets/${id}/purchase`);
      await fetchSweets();
      setSelectedSweet(null);
      addToast('Yum! Sweet purchased.', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Purchase failed', 'error');
    }
  };

  const openModal = (sweet) => {
    setSelectedSweet(sweet);
  };

  const closeModal = () => {
    setSelectedSweet(null);
  };

  useEffect(() => {
    fetchSweets();
  }, []);

  return (
    <div className="container">
      <Header />

      <h1 className="header-title">Available Sweets</h1>

      <SearchBar onSearch={handleSearch} />

      {loading && <div>Loading sweets…</div>}
      {error && <div style={{ color: 'var(--danger)' }}>{error}</div>}

      {filteredSweets.length === 0 && !loading && (
        <div style={{ textAlign: 'center', color: 'var(--text-light)', padding: 20 }}>
          No sweets found. Try adjusting your search.
        </div>
      )}

      <div className="grid-layout">
        {filteredSweets.map((s) => (
          <div key={s._id} onClick={() => openModal(s)} style={{ cursor: 'pointer' }}>
            <SweetCard sweet={s} onBuy={handlePurchase} />
          </div>
        ))}
      </div>

      <SweetModal sweet={selectedSweet} onClose={closeModal} onBuy={handlePurchase} />
    </div>
  );
};

export default Dashboard;