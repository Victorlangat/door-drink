import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { LayoutGrid, ShoppingBag, Shield, LogOut, Menu, X, User } from 'lucide-react';

const Navbar = () => {
  const { user, setUser } = useContext(AppContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 769);
  
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 769);
      if (window.innerWidth >= 769) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
    setIsMenuOpen(false);
  };
  
  if (!user) return null;
  
  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: '#ffffff',
      color: '#1a1a1a',
      padding: '0.75rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 1000,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      borderBottom: '1px solid #e5e7eb'
    }}>
      {/* Logo */}
      <Link to="/pos" style={{ textDecoration: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingBag size={24} color="#3b82f6" />
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>SipSync</span>
        </div>
      </Link>
      
      {/* Desktop Menu - Always visible on desktop */}
      <div style={{
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'center'
      }} className="desktop-menu">
        <Link to="/pos" style={{ 
          color: '#4b5563', 
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 500
        }}>
          <LayoutGrid size={18} />
          POS
        </Link>
        {user.isAdmin && (
          <Link to="/admin" style={{ 
            color: '#4b5563', 
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 500
          }}>
            <Shield size={18} />
            Admin
          </Link>
        )}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          paddingLeft: '1rem',
          borderLeft: '1px solid #e5e7eb'
        }}>
          <User size={16} color="#6b7280" />
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{user.email}</span>
        </div>
        <button onClick={handleLogout} style={{
          background: '#ef4444',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          cursor: 'pointer',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          transition: 'all 0.2s'
        }}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
      
      {/* Mobile Menu Button - Only visible on mobile */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '0.5rem',
          display: 'none'
        }}
        className="mobile-menu-btn"
      >
        {isMenuOpen ? <X size={24} color="#1f2937" /> : <Menu size={24} color="#1f2937" />}
      </button>
      
      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '60px',
          left: 0,
          right: 0,
          background: '#ffffff',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          borderTop: '1px solid #e5e7eb',
          borderBottom: '1px solid #e5e7eb',
          zIndex: 999,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
        }}>
          <Link to="/pos" style={{ 
            color: '#4b5563', 
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            borderRadius: '8px',
            background: '#f3f4f6'
          }} onClick={() => setIsMenuOpen(false)}>
            <LayoutGrid size={20} />
            POS
          </Link>
          {user.isAdmin && (
            <Link to="/admin" style={{ 
              color: '#4b5563', 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: '8px',
              background: '#f3f4f6'
            }} onClick={() => setIsMenuOpen(false)}>
              <Shield size={20} />
              Admin
            </Link>
          )}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            padding: '0.75rem',
            color: '#6b7280',
            borderTop: '1px solid #e5e7eb',
            marginTop: '0.25rem'
          }}>
            <User size={18} />
            <span style={{ fontSize: '0.875rem' }}>{user.email}</span>
          </div>
          <button onClick={handleLogout} style={{
            background: '#ef4444',
            border: 'none',
            padding: '0.75rem',
            borderRadius: '8px',
            cursor: 'pointer',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 500
          }}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      )}
      
      <style>
        {`
          @media (max-width: 768px) {
            .desktop-menu {
              display: none !important;
            }
            .mobile-menu-btn {
              display: block !important;
            }
          }
          
          @media (min-width: 769px) {
            .mobile-menu-btn {
              display: none !important;
            }
            .desktop-menu {
              display: flex !important;
            }
          }
        `}
      </style>
    </nav>
  );
};

export default Navbar;