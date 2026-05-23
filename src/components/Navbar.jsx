import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ShoppingBag, LayoutGrid, Shield, LogOut, Menu, X, User, Store } from 'lucide-react';

const Navbar = () => {
  const { store, admin, logout } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
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
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsMenuOpen(false);
  };
  
  const hideNavbar = ['/login', '/signup', '/admin/login', '/admin/register', '/admin/check'].includes(location.pathname);
  
  if (hideNavbar || !store) return null;
  
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      background: 'var(--text-inverse)',
      padding: '0.75rem 1.5rem',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      zIndex: 1000,
      boxShadow: 'var(--shadow-sm)',
      borderBottom: '1px solid var(--nexus-border)'
    }}>
      <Link to="/pos" style={{ textDecoration: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingBag size={24} color="var(--nexus-primary)" />
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--nexus-primary)' }}>Nexus</span>
        </div>
      </Link>
      
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }} className="desktop-menu">
        <Link to="/pos" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, transition: 'color 0.2s' }}>
          <LayoutGrid size={18} /> POS
        </Link>
        
        <Link to="/admin/check" style={{ color: 'var(--nexus-accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, transition: 'color 0.2s' }}>
          <Shield size={18} /> Admin
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '1rem', borderLeft: '1px solid var(--nexus-border)' }}>
          <Store size={16} color="var(--text-tertiary)" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{store?.store_name}</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={16} color="var(--text-tertiary)" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{admin?.email || store?.store_email}</span>
        </div>
        
        <button onClick={handleLogout} className="btn-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
      
      <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', display: 'none' }} className="mobile-menu-btn">
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {isMenuOpen && (
        <div style={{ position: 'absolute', top: '60px', left: 0, right: 0, background: 'var(--text-inverse)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--nexus-border)', zIndex: 999, boxShadow: 'var(--shadow-md)' }}>
          <Link to="/pos" style={{ padding: '0.75rem', background: 'var(--nexus-light-surface)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>
            <LayoutGrid size={20} /> POS
          </Link>
          <Link to="/admin/check" style={{ padding: '0.75rem', background: 'var(--nexus-light-surface)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--nexus-accent)', textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>
            <Shield size={20} /> Admin
          </Link>
          <div style={{ padding: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--nexus-border)' }}>
            <Store size={18} style={{ display: 'inline', marginRight: '0.5rem' }} /> {store?.store_name}
          </div>
          <button onClick={handleLogout} className="btn-danger" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
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