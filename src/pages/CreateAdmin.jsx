import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { supabase } from '../services/supabase';
import bcrypt from 'bcryptjs';
import { Shield, Mail, Lock, User, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const CreateAdmin = () => {
  const { store } = useContext(AppContext);
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError(null);
  };

  const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!formData.password) {
      setError('Password is required');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Hash password
      const hashedPassword = await hashPassword(formData.password);
      
      // Check if admin already exists
      const { data: existing } = await supabase
        .from('admin_users')
        .select('id')
        .eq('store_id', store.id)
        .eq('email', formData.email)
        .maybeSingle();
      
      if (existing) {
        throw new Error('Admin with this email already exists for this store');
      }
      
      // Create admin user
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert([{
          store_id: store.id,
          email: formData.email,
          password_hash: hashedPassword,
          full_name: formData.fullName,
          role: 'admin',
          is_active: true
        }]);
      
      if (insertError) throw insertError;
      
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/admin/login');
      }, 2000);
      
    } catch (err) {
      console.error('Admin creation error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!store) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>Please login to your store first...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        padding: '1rem'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '20px',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center'
        }}>
          <CheckCircle size={64} color="#10b981" style={{ marginBottom: '1rem' }} />
          <h2 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>Admin Created Successfully!</h2>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Admin account for {store.store_name} has been created.
          </p>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Redirecting to admin login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '20px',
        maxWidth: '450px',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            background: '#8b5cf6',
            width: '60px',
            height: '60px',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <Shield size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>Create Admin Account</h1>
          <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>
            Store: <strong>{store.store_name}</strong>
          </p>
          <p style={{ color: '#8b5cf6', fontSize: '0.875rem', marginTop: '0.5rem', background: '#f3f4f6', padding: '0.5rem', borderRadius: '8px' }}>
            After creating admin, you can login at /admin/login
          </p>
        </div>
        
        {error && (
          <div style={{
            background: '#fee2e2',
            borderLeft: '4px solid #ef4444',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} color="#ef4444" />
            <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '16px'
                }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
              Admin Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@yourstore.com"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '16px'
                }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '16px'
                }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '16px'
                }}
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              padding: '0.875rem',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Creating Admin Account...' : 'Create Admin Account'}
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
          <button
            onClick={() => navigate('/pos')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem'
            }}
          >
            <ArrowLeft size={14} />
            Back to POS
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAdmin;