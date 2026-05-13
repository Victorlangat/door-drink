import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

const AdminRedirect = () => {
  const navigate = useNavigate();
  const [storeId, setStoreId] = useState(null);

  useEffect(() => {
    const storeStr = localStorage.getItem('sipsync_store');
    if (storeStr) {
      try {
        const store = JSON.parse(storeStr);
        checkAdminExists(store.id);
      } catch (e) {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, []);

  const checkAdminExists = async (storeId) => {
    try {
      const { count, error } = await supabase
        .from('admin_users')
        .select('id', { count: 'exact', head: true })
        .eq('store_id', storeId)
        .eq('is_active', true);
      
      if (error) throw error;
      
      if (count > 0) {
        navigate('/admin/login');
      } else {
        navigate('/admin/register');
      }
    } catch (err) {
      console.error('Error checking admin:', err);
      navigate('/admin/register');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}>
      <div style={{ color: 'white', textAlign: 'center' }}>Checking admin status...</div>
    </div>
  );
};

export default AdminRedirect;