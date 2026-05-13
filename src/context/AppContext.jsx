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
  
  // Load saved data on startup
  useEffect(() => {
    const savedStore = localStorage.getItem('sipsync_store');
    const savedAdmin = localStorage.getItem('sipsync_admin');
    
    if (savedStore) {
      try {
        const storeData = JSON.parse(savedStore);
        setStore(storeData);
        setCurrentStore(storeData.id);
        loadStoreData(storeData.id);
      } catch (e) {
        console.error('Error loading store:', e);
      }
    }
    
    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (e) {
        console.error('Error loading admin:', e);
      }
    }
    
    setLoading(false);
  }, []);
  
  // Persist store
  const setStoreWithPersist = (storeData) => {
    setStore(storeData);
    if (storeData) {
      localStorage.setItem('sipsync_store', JSON.stringify(storeData));
      setCurrentStore(storeData.id);
    } else {
      localStorage.removeItem('sipsync_store');
    }
  };
  
  // Persist admin
  const setAdminWithPersist = (adminData) => {
    setAdmin(adminData);
    if (adminData) {
      localStorage.setItem('sipsync_admin', JSON.stringify(adminData));
    } else {
      localStorage.removeItem('sipsync_admin');
    }
  };
  
  // Add security log
  const addSecurityLog = async (action, details) => {
    if (!store) return;
    
    const newLog = {
      store_id: store.id,
      action: action,
      details: details,
      user_email: admin?.email || store?.store_email || 'system',
      created_at: new Date().toISOString()
    };
    
    try {
      const { data, error } = await supabase
        .from('security_logs')
        .insert([newLog])
        .select();
      
      if (!error && data) {
        setSecurityLogs(prev => [data[0], ...prev]);
      }
    } catch (err) {
      console.error('Error adding security log:', err);
    }
  };
  
  // Load store data
  const loadStoreData = async (storeId) => {
    setLoading(true);
    try {
      // Load products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId);
      
      if (productsError) throw productsError;
      setProducts(productsData || []);
      
      // Load orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      setOrders(ordersData || []);
      
      // Load customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('store_id', storeId)
        .order('total_spent', { ascending: false });
      
      if (customersError) throw customersError;
      setCustomers(customersData || []);
      
      // Load security logs
      const { data: logsData, error: logsError } = await supabase
        .from('security_logs')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .limit(200);
      
      if (logsError) throw logsError;
      setSecurityLogs(logsData || []);
      
      // Get today's counter from daily_sales table
      const today = new Date().toISOString().split('T')[0];
      const { data: todayData, error: todayError } = await supabase
        .from('daily_sales')
        .select('transaction_count, counter_number')
        .eq('store_id', storeId)
        .eq('sale_date', today)
        .maybeSingle();
      
      if (!todayError && todayData) {
        setDailyCounter(todayData.transaction_count || 0);
      } else {
        // If no daily sales record exists for today, create one
        const { error: insertError } = await supabase
          .from('daily_sales')
          .insert([{
            store_id: storeId,
            sale_date: today,
            total_revenue: 0,
            transaction_count: 0,
            counter_number: 0
          }]);
        
        if (!insertError) {
          setDailyCounter(0);
        }
      }
      
    } catch (err) {
      console.error('Error loading store data:', err);
      toast.error('Failed to load store data');
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
  
  // Cart functions
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
    if (item) toast.success(`${item.name} removed`);
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
  
  // Process order
  const processOrder = async (paymentMethod, customerName = '', customerPhone = '') => {
    if (cart.length === 0) {
      toast.error('Cart is empty!');
      return false;
    }
    if (!store) {
      toast.error('No store selected!');
      return false;
    }
    
    for (const item of cart) {
      const product = products.find(p => p.id === item.id);
      if (item.quantity > product.stock) {
        toast.error(`${item.name} - Only ${product.stock} left!`);
        return false;
      }
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderNumber = `POS-${String((dailyCounter || 0) + 1).padStart(4, '0')}`;
    
    try {
      // Update product stocks
      for (const item of cart) {
        const product = products.find(p => p.id === item.id);
        await supabase
          .from('products')
          .update({ stock: product.stock - item.quantity })
          .eq('id', item.id)
          .eq('store_id', store.id);
      }
      
      // Save order
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert([{
          store_id: store.id,
          order_number: orderNumber,
          items: cart.map(item => ({ 
            id: item.id, 
            name: item.name, 
            quantity: item.quantity, 
            price: item.price,
            category: item.category 
          })),
          total: total,
          payment_method: paymentMethod,
          customer_name: customerName || 'Walk-in Customer',
          customer_phone: customerPhone,
          created_at: new Date().toISOString()
        }])
        .select();
      
      if (orderError) throw orderError;
      
      // Update or create customer
      if (customerName && customerPhone) {
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('*')
          .eq('phone', customerPhone)
          .eq('store_id', store.id)
          .maybeSingle();
        
        if (existingCustomer) {
          await supabase
            .from('customers')
            .update({
              total_spent: (existingCustomer.total_spent || 0) + total,
              order_count: (existingCustomer.order_count || 0) + 1,
              last_order: new Date().toISOString()
            })
            .eq('id', existingCustomer.id);
        } else {
          await supabase.from('customers').insert([{
            store_id: store.id,
            name: customerName,
            phone: customerPhone,
            total_spent: total,
            order_count: 1,
            first_order: new Date().toISOString(),
            last_order: new Date().toISOString()
          }]);
        }
      }
      
      // Add security log
      await addSecurityLog(
        'ORDER_COMPLETED',
        `Order #${orderNumber} | Total: KSh ${total} | Items: ${cart.length} | Payment: ${paymentMethod}`
      );
      
      // Refresh all data
      await loadStoreData(store.id);
      setCart([]);
      
      toast.success(`Order ${orderNumber} completed!`);
      return { success: true, orderNumber, total };
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to process order');
      return false;
    }
  };
  
  // Admin functions
  const updateInventory = async (productId, newStock) => {
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
    const { data, error } = await supabase
      .from('products')
      .insert([{
        store_id: store.id,
        name: product.name,
        category: product.category || 'Uncategorized',
        price: parseFloat(product.price),
        stock: parseInt(product.stock)
      }])
      .select()
      .single();
    
    if (error) throw error;
    setProducts([...products, data]);
    await addSecurityLog('PRODUCT_ADDED', `Added: ${product.name} (Price: KSh ${product.price}, Stock: ${product.stock})`);
    toast.success('Product added');
    return data;
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
  
  // Analytics functions
  const getSalesAnalytics = async () => {
    if (!store) return { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0, categorySales: {}, topProducts: [], repeatCustomers: 0 };
    
    const { data: ordersList } = await supabase
      .from('orders')
      .select('*')
      .eq('store_id', store.id);
    
    const totalRevenue = (ordersList || []).reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = ordersList?.length || 0;
    const averageOrderValue = totalOrders ? (totalRevenue / totalOrders).toFixed(2) : 0;
    
    // Get fresh customers for repeat count
    const { data: customersList } = await supabase
      .from('customers')
      .select('*')
      .eq('store_id', store.id);
    const repeatCustomers = (customersList || []).filter(c => (c.order_count || 0) > 1).length;
    
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
      time: new Date(o.created_at).toLocaleTimeString(),
      customerName: o.customer_name,
      paymentMethod: o.payment_method,
      total: o.total || 0
    }));
    
    const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
    
    return {
      date: today,
      transactionCount: transactions.length,
      totalRevenue,
      transactions,
      counterNumber: dailyCounter
    };
  };
  
  const getSecurityLogs = async () => {
    if (!store) return [];
    return securityLogs;
  };
  
  const getInventoryValue = () => {
    return products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);
  };
  
  const getCartTotal = () => cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
  const getCartCount = () => cart.reduce((count, item) => count + (item.quantity || 0), 0);
  
  if (loading && !store) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }
  
  return (
    <AppContext.Provider value={{
      products, cart, orders, store, admin, customers, dailyCounter, securityLogs,
      setStore: setStoreWithPersist,
      setAdmin: setAdminWithPersist,
      loadStoreData,
      addToCart, removeFromCart, updateQuantity, clearCart, processOrder,
      updateInventory, addNewProduct, deleteProduct,
      getSalesAnalytics, getDailyReport, getInventoryValue, getSecurityLogs,
      getCartTotal, getCartCount, addSecurityLog
    }}>
      {children}
    </AppContext.Provider>
  );
};