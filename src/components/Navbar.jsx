import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Navbar = () => {
  const { user, setUser } = useContext(AppContext);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: '#1a1a1a',
      color: 'white',
      padding: '0.75rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 1000,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
        🍷 Door Drink Kenya | POS System
      </div>
      
      {user && (
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link to="/pos" style={{ color: 'white', textDecoration: 'none' }}>💰 POS</Link>
          {user.isAdmin && (
            <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>📊 Admin</Link>
          )}
          <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>👤 {user.email}</span>
          <button onClick={handleLogout} style={{
            background: '#ff4444',
            border: 'none',
            padding: '0.4rem 1rem',
            borderRadius: '5px',
            cursor: 'pointer',
            color: 'white'
          }}>Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;