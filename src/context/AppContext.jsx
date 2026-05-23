import React, { createContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase, setCurrentStore } from '../services/supabase';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [store, setStore] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [dailyCounter, setDailyCounter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [userRole, setUserRole] = useState(null);
  
  // Load saved data on startup
  useEffect(() => {
    const initStore = async () => {
      const savedStore = localStorage.getItem('sipsync_store');
      const savedAdmin = localStorage.getItem('sipsync_admin');
      const savedUserRole = localStorage.getItem('sipsync_user_role');
      
      console.log('Restoring session - Store:', savedStore ? 'Found' : 'Not found');
      console.log('Restoring session - Admin:', savedAdmin ? 'Found' : 'Not found');
      console.log('Restoring session - User Role:', savedUserRole);
      
      if (savedUserRole) {
        setUserRole(savedUserRole);
      }
      
      if (savedStore) {
        try {
          const storeData = JSON.parse(savedStore);
          setStore(storeData);
          setCurrentStore(storeData.id);
          await loadStoreData(storeData.id);
        } catch (e) {
          console.error('Error loading store:', e);
        }
      }
      
      if (savedAdmin) {
        try {
          const adminData = JSON.parse(savedAdmin);
          setAdmin(adminData);
        } catch (e) {
          console.error('Error loading admin:', e);
        }
      }
      
      setLoading(false);
    };
    
    initStore();
  }, []);
  
  // Persist store with RLS context
  const setStoreWithPersist = async (storeData) => {
    console.log('Setting store with persist:', storeData);
    setStore(storeData);
    if (storeData) {
      localStorage.setItem('sipsync_store', JSON.stringify(storeData));
      await setCurrentStore(storeData.id);
    } else {
      localStorage.removeItem('sipsync_store');
      localStorage.removeItem('sipsync_session_token');
    }
  };
  
  // Persist admin
  const setAdminWithPersist = (adminData) => {
    console.log('Setting admin with persist:', adminData);
    setAdmin(adminData);
    if (adminData) {
      localStorage.setItem('sipsync_admin', JSON.stringify(adminData));
      setUserRoleWithPersist('admin');
    } else {
      localStorage.removeItem('sipsync_admin');
    }
  };
  
  // Set user role
  const setUserRoleWithPersist = (role) => {
    console.log('Setting user role:', role);
    setUserRole(role);
    if (role) {
      localStorage.setItem('sipsync_user_role', role);
    } else {
      localStorage.removeItem('sipsync_user_role');
    }
  };
  
  // Add security log
  const addSecurityLog = async (action, details) => {
    if (!store) return;
    
    const userEmail = admin?.email || store?.store_email || 'system';
    const now = new Date();
    const timestamp = now.toISOString();
    
    try {
      const { error } = await supabase
        .from('security_logs')
        .insert([{
          store_id: store.id,
          action: action,
          details: details,
          user_email: userEmail,
          created_at: timestamp
        }]);
      
      if (!error) {
        const { data: logsData } = await supabase
          .from('security_logs')
          .select('*')
          .eq('store_id', store.id)
          .order('created_at', { ascending: false })
          .limit(200);
        if (logsData) setSecurityLogs(logsData);
      }
    } catch (err) {
      console.error('Error adding security log:', err);
    }
  };
  
  const loadStoreData = async (storeId) => {
    setLoading(true);
    await setCurrentStore(storeId);
    
    try {
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .order('name', { ascending: true });
      setProducts(productsData || []);
      
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });
      setOrders(ordersData || []);
      
      const { data: customersData } = await supabase
        .from('customers')
        .select('*')
        .eq('store_id', storeId)
        .order('total_spent', { ascending: false });
      setCustomers(customersData || []);
      
      const { data: logsData } = await supabase
        .from('security_logs')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .limit(200);
      setSecurityLogs(logsData || []);
      
      const today = new Date().toISOString().split('T')[0];
      const { data: todayData } = await supabase
        .from('daily_sales')
        .select('transaction_count')
        .eq('store_id', storeId)
        .eq('sale_date', today)
        .maybeSingle();
      
      setDailyCounter(todayData?.transaction_count || 0);
    } catch (err) {
      console.error('Error loading store data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Cart persistence
  useEffect(() => {
    const savedCart = localStorage.getItem('sipsync_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);
  
  useEffect(() => {
    localStorage.setItem('sipsync_cart', JSON.stringify(cart));
  }, [cart]);
  
  const addToCart = (product, quantity = 1) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > product.stock) {
        toast.error(`Only ${product.stock} in stock!`);
        return;
      }
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: newQty } : item));
    } else {
      if (quantity > product.stock) {
        toast.error(`Only ${product.stock} in stock!`);
        return;
      }
      setCart([...cart, { ...product, quantity }]);
    }
    toast.success(`${product.name} added`);
  };
  
  const removeFromCart = (id) => {
    const item = cart.find(i => i.id === id);
    setCart(cart.filter(i => i.id !== id));
    toast.success(`${item?.name} removed`);
  };
  
  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    const product = products.find(p => p.id === id);
    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} in stock!`);
      return;
    }
    setCart(cart.map(item => item.id === id ? { ...item, quantity } : item));
  };
  
  const clearCart = () => {
    setCart([]);
    toast.success('Cart cleared');
  };
  
  // OPTIMIZED PROCESS ORDER - FAST AND RELIABLE
  const processOrder = async (paymentMethod, customerName = '', customerPhone = '') => {
    if (cart.length === 0) {
      toast.error('Cart is empty!');
      return false;
    }
    
    if (!store) {
      toast.error('No store selected!');
      return false;
    }
    
    // Quick stock validation
    for (const item of cart) {
      const product = products.find(p => p.id === item.id);
      if (item.quantity > product.stock) {
        toast.error(`${item.name} - Only ${product.stock} left!`);
        return false;
      }
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderNumber = `POS-${String((dailyCounter || 0) + 1).padStart(4, '0')}`;
    const timestamp = new Date().toISOString();
    const orderItems = cart.map(item => ({ 
      id: item.id, 
      name: item.name, 
      quantity: item.quantity, 
      price: item.price,
      category: item.category 
    }));
    
    try {
      // OPTIMIZATION: Update all product stocks in parallel
      const stockUpdatePromises = cart.map(item => {
        const product = products.find(p => p.id === item.id);
        return supabase
          .from('products')
          .update({ stock: product.stock - item.quantity })
          .eq('id', item.id)
          .eq('store_id', store.id);
      });
      
      // Create order
      const orderPromise = supabase
        .from('orders')
        .insert([{
          store_id: store.id,
          order_number: orderNumber,
          items: orderItems,
          total: total,
          payment_method: paymentMethod,
          customer_name: customerName || 'Walk-in Customer',
          customer_phone: customerPhone,
          created_at: timestamp
        }]);
      
      // Run all updates in parallel
      await Promise.all([...stockUpdatePromises, orderPromise]);
      
      // Handle customer in background (non-blocking)
      if (customerName && customerPhone) {
        supabase
          .from('customers')
          .select('id, total_spent, order_count')
          .eq('phone', customerPhone)
          .eq('store_id', store.id)
          .maybeSingle()
          .then(async ({ data: existingCustomer }) => {
            if (existingCustomer) {
              await supabase
                .from('customers')
                .update({
                  total_spent: (existingCustomer.total_spent || 0) + total,
                  order_count: (existingCustomer.order_count || 0) + 1,
                  last_order: timestamp
                })
                .eq('id', existingCustomer.id);
            } else {
              await supabase.from('customers').insert([{
                store_id: store.id,
                name: customerName,
                phone: customerPhone,
                total_spent: total,
                order_count: 1,
                first_order: timestamp,
                last_order: timestamp
              }]);
            }
          });
      }
      
      // Security log in background
      supabase
        .from('security_logs')
        .insert([{
          store_id: store.id,
          action: 'ORDER_COMPLETED',
          details: `Order #${orderNumber} | Total: KSh ${total} | Items: ${cart.length} | Payment: ${paymentMethod}`,
          user_email: admin?.email || store?.store_email || 'system',
          created_at: timestamp
        }]);
      
      // Update local state immediately (optimistic update)
      const updatedProducts = products.map(product => {
        const cartItem = cart.find(item => item.id === product.id);
        if (cartItem) {
          return { ...product, stock: product.stock - cartItem.quantity };
        }
        return product;
      });
      setProducts(updatedProducts);
      setDailyCounter(prev => prev + 1);
      setCart([]);
      
      toast.success(`Order ${orderNumber} completed!`);
      return { success: true, orderNumber, total };
      
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to process order');
      return false;
    }
  };
  
  const updateInventory = async (productId, newStock) => {
    if (!store) return;
    const product = products.find(p => p.id === productId);
    await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId)
      .eq('store_id', store.id);
    setProducts(products.map(p => p.id === productId ? { ...p, stock: newStock } : p));
    await addSecurityLog('INVENTORY_UPDATE', `${product?.name}: ${product?.stock} → ${newStock}`);
    toast.success('Inventory updated');
  };
  
  const addNewProduct = async (product) => {
    if (!store) {
      toast.error('No store selected. Please login again.');
      return null;
    }
    
    const cleanName = product.name.trim();
    const cleanCategory = product.category?.trim() || 'Uncategorized';
    const cleanPrice = parseFloat(product.price);
    const cleanStock = parseInt(product.stock);
    
    try {
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id, stock')
        .eq('store_id', store.id)
        .eq('name', cleanName)
        .eq('category', cleanCategory)
        .maybeSingle();
      
      if (existingProduct) {
        const newStock = existingProduct.stock + cleanStock;
        await supabase
          .from('products')
          .update({ stock: newStock, price: cleanPrice })
          .eq('id', existingProduct.id);
        
        setProducts(products.map(p => 
          p.id === existingProduct.id ? { ...p, stock: newStock, price: cleanPrice } : p
        ));
        
        await addSecurityLog('INVENTORY_UPDATE', `Updated: ${cleanName} - Stock +${cleanStock} (New: ${newStock})`);
        toast.success(`${cleanName} stock updated! New stock: ${newStock}`);
        return { ...existingProduct, stock: newStock };
      }
      
      const { data, error } = await supabase
        .from('products')
        .insert([{
          store_id: store.id,
          name: cleanName,
          category: cleanCategory,
          price: cleanPrice,
          stock: cleanStock,
          image_url: product.image_url || null
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      setProducts([...products, data]);
      await addSecurityLog('PRODUCT_ADDED', `Added: ${cleanName} (${cleanCategory}) | Price: KSh ${cleanPrice} | Stock: ${cleanStock}`);
      toast.success(`New product "${cleanName}" added`);
      return data;
    } catch (error) {
      console.error('Add product error:', error);
      toast.error(error.message);
      throw error;
    }
  };
  
  const deleteProduct = async (productId) => {
    const product = products.find(p => p.id === productId);
    await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('store_id', store.id);
    setProducts(products.filter(p => p.id !== productId));
    await addSecurityLog('PRODUCT_DELETED', `Deleted: ${product?.name}`);
    toast.success('Product deleted');
  };
  
  const getSalesAnalytics = async () => {
    if (!store) return { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0, categorySales: {}, topProducts: [], repeatCustomers: 0 };
    
    const { data: ordersList } = await supabase
      .from('orders')
      .select('*')
      .eq('store_id', store.id);
    
    const totalRevenue = (ordersList || []).reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = ordersList?.length || 0;
    const averageOrderValue = totalOrders ? (totalRevenue / totalOrders).toFixed(2) : 0;
    const repeatCustomers = customers.filter(c => (c.order_count || 0) > 1).length;
    
    const categorySales = {};
    (ordersList || []).forEach(order => {
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          const category = item.category || 'Other';
          categorySales[category] = (categorySales[category] || 0) + (item.price * item.quantity);
        });
      }
    });
    
    const productSales = {};
    (ordersList || []).forEach(order => {
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          if (!productSales[item.name]) {
            productSales[item.name] = { name: item.name, quantity: 0, revenue: 0 };
          }
          productSales[item.name].quantity += item.quantity;
          productSales[item.name].revenue += item.price * item.quantity;
        });
      }
    });
    const topProducts = Object.values(productSales).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    
    return { totalRevenue, totalOrders, averageOrderValue, categorySales, topProducts, repeatCustomers };
  };
  
  const getDailyReport = async () => {
    if (!store) return { date: new Date().toDateString(), transactionCount: 0, totalRevenue: 0, transactions: [], counterNumber: 0 };
    
    const today = new Date().toISOString().split('T')[0];
    const { data: todayOrders } = await supabase
      .from('orders')
      .select('*')
      .eq('store_id', store.id)
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`)
      .order('created_at', { ascending: false });
    
    const transactions = (todayOrders || []).map(o => ({
      id: o.id,
      orderNumber: o.order_number,
      time: o.created_at,
      customerName: o.customer_name,
      paymentMethod: o.payment_method,
      total: o.total || 0
    }));
    
    return {
      date: today,
      transactionCount: transactions.length,
      totalRevenue: transactions.reduce((sum, t) => sum + t.total, 0),
      transactions,
      counterNumber: dailyCounter
    };
  };
  
  const getInventoryValue = () => products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);
  const getCartTotal = () => cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
  const getCartCount = () => cart.reduce((count, item) => count + (item.quantity || 0), 0);
  
  const logout = () => {
    setStore(null);
    setAdmin(null);
    setProducts([]);
    setCart([]);
    setOrders([]);
    setCustomers([]);
    setSecurityLogs([]);
    setUserRole(null);
    localStorage.removeItem('sipsync_store');
    localStorage.removeItem('sipsync_admin');
    localStorage.removeItem('sipsync_cart');
    localStorage.removeItem('sipsync_session_token');
    localStorage.removeItem('sipsync_user_role');
    toast.success('Logged out successfully');
  };
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
      </div>
    );
  }
  
  return (
    <AppContext.Provider value={{
      products, cart, orders, store, admin, customers, dailyCounter, securityLogs,
      userRole,
      setStore: setStoreWithPersist, 
      setAdmin: setAdminWithPersist,
      setUserRole: setUserRoleWithPersist,
      loadStoreData,
      addToCart, removeFromCart, updateQuantity, clearCart, processOrder,
      updateInventory, addNewProduct, deleteProduct,
      getSalesAnalytics, getDailyReport, getInventoryValue, getSecurityLogs: () => securityLogs,
      getCartTotal, getCartCount, addSecurityLog, logout
    }}>
      {children}
    </AppContext.Provider>
  );
};