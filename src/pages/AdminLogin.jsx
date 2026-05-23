import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { supabase } from '../services/supabase';
import bcrypt from 'bcryptjs';
import { Shield, Mail, Lock, LogIn, AlertCircle, ArrowLeft } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setAdmin, setStore, store } = useContext(AppContext);
  const navigate = useNavigate();

  // If already logged in as admin, redirect to admin dashboard
  React.useEffect(() => {
    const savedAdmin = localStorage.getItem('sipsync_admin');
    if (savedAdmin) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Check if admin exists with this email
      const { data, error } = await supabase
        .from('admin_users')
        .select(`
          id, 
          email, 
          password_hash, 
          full_name, 
          role, 
          is_active, 
          store_id,
          stores!inner (id, store_name, store_email, subscription_plan)
        `)
        .eq('email', email)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error || !data) throw new Error('Admin not found');
      
      // Verify password
      const isValid = await bcrypt.compare(password, data.password_hash);
      if (!isValid) throw new Error('Invalid password');
      
      // Update last login
      await supabase.from('admin_users').update({ last_login: new Date() }).eq('id', data.id);
      
      // Get store data
      const storeData = data.stores;
      
      // Set admin and store in context
      const adminData = {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        role: data.role,
        store: storeData
      };
      
      setAdmin(adminData);
      
      // If store is not set in context, set it
      if (!store) {
        setStore(storeData);
      }
      
      // Navigate to admin dashboard
      navigate('/admin');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', padding: '1rem' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Shield size={48} color="#8b5cf6" />
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Admin Login</h1>
          <p style={{ color: '#6b7280' }}>Access store management</p>
        </div>
        
        {error && (
          <div style={{ background: '#fee2e2', borderLeft: '4px solid #ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} color="#ef4444" />
            <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Admin Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="admin@yourstore.com" 
              required 
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '10px' }} 
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••" 
              required 
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '10px' }} 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            style={{ width: '100%', background: '#8b5cf6', color: 'white', border: 'none', padding: '0.875rem', borderRadius: '10px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            <LogIn size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
            {loading ? 'Logging in...' : 'Access Admin Panel'}
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button onClick={() => navigate('/pos')} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
            <ArrowLeft size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
            Back to POS
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;