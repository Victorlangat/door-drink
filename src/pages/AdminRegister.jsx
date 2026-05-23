import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { supabase } from '../services/supabase';
import bcrypt from 'bcryptjs';
import { Shield, Mail, Lock, User, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const AdminRegister = () => {
  const { store, setAdmin } = useContext(AppContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // If no store, redirect to login
    if (!store) {
      navigate('/login');
    }
  }, [store, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName.trim()) { setError('Full name is required'); return; }
    if (!formData.email.trim()) { setError('Email is required'); return; }
    if (!formData.password) { setError('Password is required'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    
    setLoading(true);
    setError(null);
    
    try {
      const hashedPassword = await bcrypt.hash(formData.password, 10);
      
      const { data, error: insertError } = await supabase
        .from('admin_users')
        .insert([{
          store_id: store.id,
          email: formData.email,
          password_hash: hashedPassword,
          full_name: formData.fullName,
          role: 'admin',
          is_active: true
        }])
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      // Set admin in context and localStorage
      const adminData = {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        role: data.role,
        store: store
      };
      setAdmin(adminData);
      
      setSuccess(true);
      setTimeout(() => navigate('/admin'), 2000);
      
    } catch (err) {
      console.error('Admin registration error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!store) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }
  
  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', padding: '1rem' }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <CheckCircle size={64} color="#10b981" style={{ marginBottom: '1rem' }} />
          <h2>Admin Created Successfully!</h2>
          <p>Redirecting to admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', padding: '1rem' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', maxWidth: '450px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Shield size={48} color="#8b5cf6" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Create Admin Account</h1>
          <p>Store: <strong>{store?.store_name}</strong></p>
          <p style={{ fontSize: '0.875rem', color: '#8b5cf6', background: '#f3f4f6', padding: '0.5rem', borderRadius: '8px', marginTop: '0.5rem' }}>
            No admin found. Please create the first admin account.
          </p>
        </div>
        
        {error && (
          <div style={{ background: '#fee2e2', borderLeft: '4px solid #ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} color="#ef4444" />
            <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '10px' }} />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Admin Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="admin@yourstore.com" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '10px' }} />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Minimum 6 characters" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '10px' }} />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '10px' }} />
          </div>
          
          <button type="submit" disabled={loading} style={{ width: '100%', background: '#8b5cf6', color: 'white', border: 'none', padding: '0.875rem', borderRadius: '10px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating Admin Account...' : 'Create Admin Account'}
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

export default AdminRegister;