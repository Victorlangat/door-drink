import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Store, Mail, Phone, Lock, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

const StoreSignup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    storeName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.storeName.trim()) { setError('Store name is required'); return; }
    if (!formData.email.trim()) { setError('Email is required'); return; }
    if (!formData.phone.trim()) { setError('Phone number is required'); return; }
    if (!formData.password) { setError('Password is required'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    
    setLoading(true);
    setError(null);
    
    try {
      // Check if store exists
      const { data: existing } = await supabase
        .from('stores')
        .select('id')
        .eq('store_email', formData.email)
        .maybeSingle();
      
      if (existing) throw new Error('A store with this email already exists');
      
      // Create store
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .insert([{
          store_name: formData.storeName,
          store_email: formData.email,
          phone: formData.phone,
          address: formData.address || null,
          subscription_plan: 'free'
        }])
        .select()
        .single();
      
      if (storeError) throw storeError;
      
      // Create daily sales record
      const today = new Date().toISOString().split('T')[0];
      await supabase.from('daily_sales').insert([{
        store_id: storeData.id,
        sale_date: today,
        total_revenue: 0,
        transaction_count: 0,
        counter_number: 0
      }]);
      
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '1rem' }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <CheckCircle size={64} color="#10b981" style={{ marginBottom: '1rem' }} />
          <h2>Registration Successful!</h2>
          <p>Your store has been created. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '1rem' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <UserPlus size={48} color="#10b981" />
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Register Your Store</h1>
          <p style={{ color: '#6b7280' }}>Start selling with SipSync POS</p>
        </div>
        
        {error && (
          <div style={{ background: '#fee2e2', borderLeft: '4px solid #ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} color="#ef4444" />
            <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Store Name *</label>
            <input type="text" name="storeName" value={formData.storeName} onChange={handleChange} placeholder="e.g., Premium Liquors" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '10px' }} />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="store@example.com" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '10px' }} />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Phone Number *</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="0712345678" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '10px' }} />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Store Address (Optional)</label>
            <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Full store address" rows="2" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '10px', resize: 'vertical' }} />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Password *</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Minimum 6 characters" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '10px' }} />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Confirm Password *</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '10px' }} />
          </div>
          
          <button type="submit" disabled={loading} style={{ width: '100%', background: '#10b981', color: 'white', border: 'none', padding: '0.875rem', borderRadius: '10px', fontWeight: '600', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating your store...' : 'Create Store Account'}
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p>Already have a store? <Link to="/login" style={{ color: '#3b82f6' }}>Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default StoreSignup;