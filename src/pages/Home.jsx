import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Home = () => {
  const { products, getCustomerInsights, voteForDrink } = useContext(AppContext);
  const insights = getCustomerInsights();
  const topDrinks = [...products].sort((a, b) => b.votes - a.votes).slice(0, 6);
  
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '10px',
        color: 'white',
        marginBottom: '3rem'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            Comfortz0n3
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          Fast delivery across Nairobi, Mombasa, Kisumu & nationwide
        </p>
        <Link to="/shop">
          <button style={{
            background: '#ff6b6b',
            border: 'none',
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            borderRadius: '5px',
            cursor: 'pointer',
            color: 'white',
            fontWeight: 'bold'
          }}>Shop Now →</button>
        </Link>
      </div>
      
      {/* Voting System */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          🗳️ Vote for Your Favorite Drinks
        </h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Help others discover the best drinks in Kenya!
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {topDrinks.map(drink => (
            <div key={drink.id} style={{
              background: 'white',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s',
              cursor: 'pointer'
            }}>
              <div style={{
                width: '100%',
                height: '200px',
                overflow: 'hidden',
                backgroundColor: '#f5f5f5'
              }}>
                <img 
                  src={drink.image} 
                  alt={drink.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s'
                  }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                  }}
                />
              </div>
              <div style={{ padding: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{drink.name}</h3>
                <p style={{ color: '#666', marginBottom: '0.5rem' }}>{drink.category}</p>
                <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '1rem' }}>
                  {drink.description?.substring(0, 80)}...
                </p>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginTop: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                    ⭐ {drink.votes} votes
                  </span>
                  <button
                    onClick={() => voteForDrink(drink.id)}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  >
                    Vote Now 🗳️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Analytics/Insights for Store Owner */}
      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          📊 Store Insights
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            background: '#f0f0f0',
            padding: '1.5rem',
            borderRadius: '10px'
          }}>
            <h3>Total Orders</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{insights.totalOrders}</p>
          </div>
          <div style={{
            background: '#f0f0f0',
            padding: '1.5rem',
            borderRadius: '10px'
          }}>
            <h3>Total Revenue</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>KSh {insights.totalSpent.toLocaleString()}</p>
          </div>
          <div style={{
            background: '#f0f0f0',
            padding: '1.5rem',
            borderRadius: '10px'
          }}>
            <h3>Average Order</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>KSh {insights.averageOrderValue.toLocaleString()}</p>
          </div>
        </div>
        
        {insights.popularItems.length > 0 && (
          <div style={{ marginTop: '1rem', background: 'white', padding: '1rem', borderRadius: '10px' }}>
            <h3>🥇 Most Popular Items</h3>
            <ul style={{ marginTop: '0.5rem' }}>
              {insights.popularItems.map(([name, qty]) => (
                <li key={name}>{name}: {qty} units sold</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;