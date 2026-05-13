import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Verify password
const verifyPassword = async (password, hash) => {
  if (hash === 'temp_password_hash') {
    return true;
  }
  return await bcrypt.compare(password, hash);
};

export const adminAuth = {
  // Register a new admin for a store
  registerAdmin: async (storeId, email, password, fullName, role = 'admin') => {
    try {
      // Check if admin already exists
      const { data: existing, error: checkError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('store_id', storeId)
        .eq('email', email)
        .maybeSingle();
      
      if (existing) {
        throw new Error('Admin with this email already exists');
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create admin user
      const { data, error } = await supabase
        .from('admin_users')
        .insert([{
          store_id: storeId,
          email: email,
          password_hash: hashedPassword,
          full_name: fullName,
          role: role,
          is_active: true
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        role: data.role
      };
      
    } catch (error) {
      console.error('Admin registration error:', error);
      throw error;
    }
  },
  
  // Login admin
  loginAdmin: async (email, password) => {
    try {
      // Get admin user with store info
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
          stores (
            id,
            store_name,
            store_email,
            subscription_plan
          )
        `)
        .eq('email', email)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        throw new Error('Admin not found');
      }
      
      // Handle first-time login (temp_password_hash)
      let isValid = false;
      let needsPasswordUpdate = false;
      
      if (data.password_hash === 'temp_password_hash') {
        isValid = true;
        needsPasswordUpdate = true;
      } else {
        isValid = await verifyPassword(password, data.password_hash);
      }
      
      if (!isValid) {
        throw new Error('Invalid password');
      }
      
      // If first login, update password hash
      if (needsPasswordUpdate) {
        const newHash = await hashPassword(password);
        await supabase
          .from('admin_users')
          .update({ password_hash: newHash })
          .eq('id', data.id);
      }
      
      // Update last login
      await supabase
        .from('admin_users')
        .update({ last_login: new Date() })
        .eq('id', data.id);
      
      // Return admin info
      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        role: data.role,
        store: data.stores,
        isAdmin: true
      };
      
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  },
  
  // Check if current user is admin for their store
  isStoreAdmin: (admin, storeId) => {
    return admin && admin.store && admin.store.id === storeId && admin.role === 'admin';
  },
  
  // Get all admins for a store
  getStoreAdmins: async (storeId) => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, email, full_name, role, is_active, last_login, created_at')
      .eq('store_id', storeId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },
  
  // Check if store has any admin
  hasAnyAdmin: async (storeId) => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id', { count: 'exact', head: true })
      .eq('store_id', storeId);
    
    if (error) throw error;
    return data.length > 0;
  },
  
  // Deactivate admin
  deactivateAdmin: async (adminId, storeId) => {
    const { error } = await supabase
      .from('admin_users')
      .update({ is_active: false })
      .eq('id', adminId)
      .eq('store_id', storeId);
    
    if (error) throw error;
    return true;
  },
  
  // Change admin password
  changePassword: async (adminId, oldPassword, newPassword) => {
    // Get current hash
    const { data, error } = await supabase
      .from('admin_users')
      .select('password_hash')
      .eq('id', adminId)
      .single();
    
    if (error) throw error;
    
    // Verify old password
    let isValid;
    if (data.password_hash === 'temp_password_hash') {
      isValid = true;
    } else {
      isValid = await verifyPassword(oldPassword, data.password_hash);
    }
    
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }
    
    // Hash new password
    const newHash = await hashPassword(newPassword);
    
    // Update password
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ password_hash: newHash })
      .eq('id', adminId);
    
    if (updateError) throw updateError;
    return true;
  }
};