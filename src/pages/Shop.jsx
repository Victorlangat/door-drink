import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

const Shop = () => {
  const { products, addToCart } = useContext(AppContext);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  
  const categories = ['all', ...new Set(products.map(p => p.category))];
  
  const filteredProducts = products.filter(product => {
    const matchesCategory = category === 'all' || product.category === category;
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Our Liquor Collection</h1>
      
      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="Search drinks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '5px',
            flex: 1,
            minWidth: '200px'
          }}
        />
        
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '5px'
          }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>
      
      {/* Products Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '2rem'
      }}>
        {filteredProducts.map(product => (
          <div key={product.id} style={{
            background: 'white',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s'
          }}>
            <div style={{ padding: '1rem' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{product.name}</h3>
              <p style={{ color: '#666' }}>{product.category}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2e7d32' }}>
                KSh {product.price}
              </p>
              <p style={{ 
                color: product.stock > 10 ? '#4CAF50' : product.stock > 0 ? '#ff9800' : '#f44336',
                marginBottom: '1rem'
              }}>
                {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => addToCart(product, 1)}
                  disabled={product.stock === 0}
                  style={{
                    flex: 1,
                    background: product.stock === 0 ? '#ccc' : '#2196F3',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '5px',
                    cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                    color: 'white'
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shop;