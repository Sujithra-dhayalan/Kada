import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [filters, setFilters] = useState({
    name: '',
    category: '',
    minPrice: '',
    maxPrice: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({ name: '', category: '', minPrice: '', maxPrice: '' });
    onSearch({ name: '', category: '', minPrice: '', maxPrice: '' });
  };

  return (
    <div style={{ marginBottom: 20, padding: 15, backgroundColor: 'var(--card-bg)', borderRadius: 8, boxShadow: 'var(--shadow)' }}>
      <form onSubmit={handleSearch}>
        <h3 style={{ marginTop: 0, color: 'var(--primary-color)' }}>Search Sweets</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 10 }}>
          <input
            type="text"
            name="name"
            placeholder="Sweet name"
            value={filters.name}
            onChange={handleChange}
            className="input-field"
            style={{ marginBottom: 0 }}
          />
          
          <input
            type="text"
            name="category"
            placeholder="Category (e.g., Choco, Hard)"
            value={filters.category}
            onChange={handleChange}
            className="input-field"
            style={{ marginBottom: 0 }}
          />
          
          <input
            type="number"
            name="minPrice"
            placeholder="Min price ($)"
            value={filters.minPrice}
            onChange={handleChange}
            className="input-field"
            style={{ marginBottom: 0 }}
          />
          
          <input
            type="number"
            name="maxPrice"
            placeholder="Max price ($)"
            value={filters.maxPrice}
            onChange={handleChange}
            className="input-field"
            style={{ marginBottom: 0 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="btn" style={{ flex: 1 }}>Search</button>
          <button type="button" onClick={handleReset} className="btn" style={{ flex: 1, backgroundColor: 'var(--text-light)' }}>Reset</button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
