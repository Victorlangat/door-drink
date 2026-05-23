import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

const AdminRedirect = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdminExists = async () => {
      // Get store from localStorage
      const storeStr = localStorage.getItem('sipsync_store');
      
      if (!storeStr) {
        navigate('/login');
        return;
      }
      
      try {
        const store = JSON.parse(storeStr);
        console.log('Checking admin for store:', store.id);
        
        // Check if admin exists for this store
        const { count, error } = await supabase
          .from('admin_users')
          .select('id', { count: 'exact', head: true })
          .eq('store_id', store.id)
          .eq('is_active', true);
        
        console.log('Admin check result - count:', count);
        
        if (error) {
          console.error('Error checking admin:', error);
          navigate('/admin/register');
          return;
        }
        
        // If admin exists, go to login page
        if (count > 0) {
          console.log('Admin exists, redirecting to login');
          navigate('/admin/login');
        } else {
          // No admin exists, go to registration page
          console.log('No admin exists, redirecting to register');
          navigate('/admin/register');
        }
        
      } catch (err) {
        console.error('Error parsing store:', err);
        navigate('/login');
      } finally {
        setChecking(false);
      }
    };
    
    checkAdminExists();
  }, [navigate]);

  if (checking) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
      }}>
        <div style={{ color: 'white', textAlign: 'center' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 1rem' }}></div>
          <p>Checking admin status...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AdminRedirect;