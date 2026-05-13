import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { LayoutGrid, ShoppingBag, Shield, LogOut, Menu, X, User, Store } from 'lucide-react';

const Navbar = () => {
  const { store, setStore, admin, setAdmin } = useContext(AppContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 769);
  
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 769);
      if (window.innerWidth >= 769) setIsMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleLogout = () => {
    setStore(null);
    setAdmin(null);
    localStorage.removeItem('sipsync_store');
    localStorage.removeItem('sipsync_admin');
    localStorage.removeItem('sipsync_cart');
    navigate('/login');
    setIsMenuOpen(false);
  };
  
  const hideNavbar = ['/login', '/signup', '/admin/login', '/admin/register'].includes(window.location.pathname);
  if (hideNavbar || !store) return null;
  
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      background: '#ffffff', padding: '0.75rem 1.5rem',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      zIndex: 1000, boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      borderBottom: '1px solid #e5e7eb'
    }}>
      <Link to="/pos" style={{ textDecoration: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingBag size={24} color="#3b82f6" />
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>SipSync</span>
        </div>
      </Link>
      
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }} className="desktop-menu">
        <Link to="/pos" style={{ color: '#4b5563', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
          <LayoutGrid size={18} /> POS
        </Link>
        
        <Link to="/admin/check" style={{ color: '#8b5cf6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
          <Shield size={18} /> Admin
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '1rem', borderLeft: '1px solid #e5e7eb' }}>
          <Store size={16} color="#6b7280" />
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{store?.store_name}</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={16} color="#6b7280" />
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{store?.store_email}</span>
        </div>
        
        <button onClick={handleLogout} style={{ background: '#ef4444', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
      
      <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', display: 'none' }} className="mobile-menu-btn">
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {isMenuOpen && (
        <div style={{ position: 'absolute', top: '60px', left: 0, right: 0, background: 'white', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid #e5e7eb', zIndex: 999 }}>
          <Link to="/pos" style={{ padding: '0.75rem', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={() => setIsMenuOpen(false)}>
            <LayoutGrid size={20} /> POS
          </Link>
          <Link to="/admin/check" style={{ padding: '0.75rem', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={() => setIsMenuOpen(false)}>
            <Shield size={20} /> Admin
          </Link>
          <div style={{ padding: '0.75rem', color: '#6b7280', borderTop: '1px solid #e5e7eb' }}>
            <Store size={18} style={{ display: 'inline', marginRight: '0.5rem' }} /> {store?.store_name}
          </div>
          <button onClick={handleLogout} style={{ background: '#ef4444', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      )}
      
      <style>{`
        @media (max-width: 768px) { .desktop-menu { display: none !important; } .mobile-menu-btn { display: block !important; } }
        @media (min-width: 769px) { .mobile-menu-btn { display: none !important; } .desktop-menu { display: flex !important; } }
      `}</style>
    </nav>
  );
};

export default Navbar;