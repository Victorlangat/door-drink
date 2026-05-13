import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  LayoutDashboard, Package, Plus, Users, Shield, 
  TrendingUp, DollarSign, ShoppingCart, Trash2, 
  UserCheck, Repeat, Clock, FileText, Calendar,
  ChevronLeft, ChevronRight, Download, X
} from 'lucide-react';
import { supabase } from '../services/supabase';

const Admin = () => {
  const { 
    products, 
    updateInventory, 
    addNewProduct, 
    deleteProduct, 
    getSalesAnalytics, 
    getDailyReport, 
    getSecurityLogs, 
    dailyCounter, 
    getInventoryValue, 
    customers, 
    orders,
    securityLogs,
    store
  } = useContext(AppContext);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '', stock: '' });
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    categorySales: {},
    topProducts: [],
    repeatCustomers: 0
  });
  const [dailyReport, setDailyReport] = useState({
    date: new Date().toDateString(),
    transactionCount: 0,
    totalRevenue: 0,
    transactions: [],
    counterNumber: 0
  });
  const [loading, setLoading] = useState(true);
  const [showPastRecords, setShowPastRecords] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [pastOrders, setPastOrders] = useState([]);
  const [pastSummary, setPastSummary] = useState(null);
  const [pastLoading, setPastLoading] = useState(false);
  
  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    if (showPastRecords && selectedDate) {
      loadPastRecords(selectedDate);
    }
  }, [showPastRecords, selectedDate]);
  
  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsData, dailyData] = await Promise.all([
        getSalesAnalytics(),
        getDailyReport()
      ]);
      
      setAnalytics(analyticsData || {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        categorySales: {},
        topProducts: [],
        repeatCustomers: 0
      });
      
      setDailyReport(dailyData || {
        date: new Date().toDateString(),
        transactionCount: 0,
        totalRevenue: 0,
        transactions: [],
        counterNumber: 0
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadPastRecords = async (date) => {
    if (!store) return;
    
    setPastLoading(true);
    try {
      // Get daily summary
      const { data: dailySummary } = await supabase
        .from('daily_sales')
        .select('*')
        .eq('store_id', store.id)
        .eq('sale_date', date)
        .maybeSingle();
      
      // Get orders for that day
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', store.id)
        .gte('created_at', `${date}T00:00:00`)
        .lte('created_at', `${date}T23:59:59`)
        .order('created_at', { ascending: false });
      
      setPastSummary(dailySummary);
      setPastOrders(ordersData || []);
    } catch (error) {
      console.error('Error loading past records:', error);
    } finally {
      setPastLoading(false);
    }
  };
  
  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      alert('Please fill all fields');
      return;
    }
    addNewProduct(newProduct);
    setNewProduct({ name: '', category: '', price: '', stock: '' });
  };
  
  const getTopProducts = () => {
    const productSales = {};
    if (!orders || orders.length === 0) return [];
    
    orders.forEach(order => {
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
    return Object.values(productSales).sort((a, b) => b.quantity - a.quantity).slice(0, 10);
  };
  
  const topProducts = getTopProducts();
  
  const exportToCSV = () => {
    if (!pastOrders.length) return;
    
    const headers = ['Order #', 'Time', 'Customer', 'Payment', 'Items', 'Total'];
    const rows = pastOrders.map(order => [
      order.order_number,
      new Date(order.created_at).toLocaleTimeString(),
      order.customer_name || 'Walk-in Customer',
      order.payment_method || 'cash',
      order.items?.length || 0,
      order.total || 0
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };
  
  const pastTotalRevenue = pastOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  
  const tabs = [
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { id: 'inventory', icon: <Package size={18} />, label: 'Inventory' },
    { id: 'add-product', icon: <Plus size={18} />, label: 'Add Product' },
    { id: 'customers', icon: <Users size={18} />, label: 'Customers' },
    { id: 'security', icon: <Shield size={18} />, label: 'Security' }
  ];
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 60px)' }}>
        <div>Loading admin dashboard...</div>
      </div>
    );
  }
  
  return (
    <div style={{ padding: '1rem', maxWidth: '1400px', margin: '0 auto', background: '#f3f4f6', minHeight: 'calc(100vh - 60px)' }}>
      {/* Header with Tabs and Past Records Button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              style={{ 
                padding: '0.75rem 1.5rem', 
                background: activeTab === tab.id ? '#3b82f6' : 'transparent', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                color: activeTab === tab.id ? 'white' : '#4b5563', 
                fontWeight: 500, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem' 
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        
        <button 
          onClick={() => setShowPastRecords(true)}
          style={{
            background: '#8b5cf6',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 500
          }}
        >
          <FileText size={18} />
          Past Records
        </button>
      </div>
      
      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', padding: '1.25rem', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '0.85rem', opacity: 0.9 }}>Today's Orders</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{dailyCounter || 0}</p>
              <small>{dailyReport?.transactionCount || 0} transactions</small>
            </div>
            <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '0.85rem', color: '#6b7280' }}>Today's Revenue</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>KSh {(dailyReport?.totalRevenue || 0).toLocaleString()}</p>
            </div>
            <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '0.85rem', color: '#6b7280' }}>Total Revenue</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>KSh {(analytics?.totalRevenue || 0).toLocaleString()}</p>
            </div>
            <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '0.85rem', color: '#6b7280' }}>Inventory Value</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>KSh {(getInventoryValue() || 0).toLocaleString()}</p>
            </div>
          </div>
          
          <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', overflowX: 'auto' }}>
            <h3 style={{ marginBottom: '1rem' }}>Today's Transactions</h3>
            {dailyReport?.transactions && dailyReport.transactions.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Order #</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Time</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Customer</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Payment</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyReport.transactions.map((t, idx) => (
                    <tr key={t.id || idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '0.75rem' }}>{t.orderNumber}</td>
                      <td style={{ padding: '0.75rem' }}>{t.time}</td>
                      <td style={{ padding: '0.75rem' }}>{t.customerName || 'Walk-in Customer'}</td>
                      <td style={{ padding: '0.75rem' }}>{t.paymentMethod || 'cash'}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>KSh {(t.total || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>No transactions today</p>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Complete some orders in the POS to see them here</p>
              </div>
            )}
          </div>
          
          <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', marginTop: '1.5rem', overflowX: 'auto' }}>
            <h3 style={{ marginBottom: '1rem' }}>Recent Orders (All Time)</h3>
            {orders && orders.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Order #</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Customer</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Payment</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Items</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 20).map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '0.75rem' }}>{order.order_number}</td>
                      <td style={{ padding: '0.75rem' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '0.75rem' }}>{order.customer_name || 'Walk-in Customer'}</td>
                      <td style={{ padding: '0.75rem' }}>{order.payment_method || 'cash'}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>{order.items?.length || 0}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>KSh {(order.total || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot style={{ background: '#f3f4f6' }}>
                  <tr>
                    <td colSpan="5" style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>Total Orders: {orders.length}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>KSh {(orders.reduce((sum, o) => sum + (o.total || 0), 0)).toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>No orders yet</p>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Complete some orders in the POS to see them here</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* INVENTORY TAB */}
      {activeTab === 'inventory' && (
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', overflowX: 'auto' }}>
          <h2 style={{ marginBottom: '1rem' }}>Current Inventory</h2>
          {products && products.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Product</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Category</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Price</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Stock</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Value</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem' }}>{product.name}</td>
                    <td style={{ padding: '0.75rem' }}>{product.category}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>KSh {(product.price || 0).toLocaleString()}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <input 
                        type="number" 
                        value={product.stock || 0} 
                        onChange={(e) => updateInventory(product.id, parseInt(e.target.value))} 
                        style={{ width: '80px', padding: '0.5rem', textAlign: 'center', borderRadius: '8px', border: '1px solid #e5e7eb' }} 
                      />
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>KSh {((product.price || 0) * (product.stock || 0)).toLocaleString()}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <button onClick={() => deleteProduct(product.id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot style={{ background: '#f3f4f6', fontWeight: 'bold' }}>
                <tr>
                  <td colSpan="4" style={{ padding: '0.75rem', textAlign: 'right' }}>Total Inventory Value:</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>KSh {(getInventoryValue() || 0).toLocaleString()}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>No products found. Add some products to get started.</p>
          )}
        </div>
      )}
      
      {/* ADD PRODUCT TAB */}
      {activeTab === 'add-product' && (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Add New Product</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Product Name *" 
              value={newProduct.name} 
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} 
              style={{ padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '10px' }} 
            />
            <input 
              type="text" 
              placeholder="Category" 
              value={newProduct.category} 
              onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} 
              style={{ padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '10px' }} 
            />
            <input 
              type="number" 
              placeholder="Price (KSh) *" 
              value={newProduct.price} 
              onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} 
              style={{ padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '10px' }} 
            />
            <input 
              type="number" 
              placeholder="Stock Quantity *" 
              value={newProduct.stock} 
              onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} 
              style={{ padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '10px' }} 
            />
            <button 
              onClick={handleAddProduct} 
              style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}
            >
              Add Product
            </button>
          </div>
        </div>
      )}
      
      {/* CUSTOMERS TAB */}
      {activeTab === 'customers' && (
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px' }}>
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} /> Customer Analytics
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
              <UserCheck size={24} color="#3b82f6" style={{ marginBottom: '0.5rem' }} />
              <h4 style={{ fontSize: '0.85rem', color: '#6b7280' }}>Total Customers</h4>
              <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#3b82f6' }}>{customers?.length || 0}</p>
            </div>
            <div style={{ background: '#ecfdf5', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
              <Repeat size={24} color="#10b981" style={{ marginBottom: '0.5rem' }} />
              <h4 style={{ fontSize: '0.85rem', color: '#6b7280' }}>Repeat Customers</h4>
              <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981' }}>{analytics?.repeatCustomers || 0}</p>
            </div>
            <div style={{ background: '#fffbeb', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
              <DollarSign size={24} color="#f59e0b" style={{ marginBottom: '0.5rem' }} />
              <h4 style={{ fontSize: '0.85rem', color: '#6b7280' }}>Avg Order Value</h4>
              <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#f59e0b' }}>KSh {analytics?.averageOrderValue || 0}</p>
            </div>
          </div>
          
          <h3 style={{ marginBottom: '1rem' }}>Customer List</h3>
          <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
            {customers && customers.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6', position: 'sticky', top: 0 }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>#</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Phone</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total Spent</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Orders</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Last Order</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, idx) => (
                    <tr key={c.id || idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '0.75rem' }}>{idx + 1}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 500 }}>{c.name}</td>
                      <td style={{ padding: '0.75rem' }}>{c.phone}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>KSh {(c.total_spent || 0).toLocaleString()}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <span style={{ background: c.order_count > 1 ? '#dbeafe' : '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '20px', fontSize: '0.75rem' }}>
                          {c.order_count || 0} {c.order_count > 1 ? 'orders' : 'order'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                        {c.last_order ? new Date(c.last_order).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>No customers yet</p>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Customers will appear here when they make purchases</p>
              </div>
            )}
          </div>
          
          {customers && customers.length > 0 && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f3f4f6', borderRadius: '12px' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Customer Insights</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Average Spend per Customer</span>
                  <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>KSh {customers.length > 0 ? Math.round((customers.reduce((sum, c) => sum + (c.total_spent || 0), 0) / customers.length)).toLocaleString() : 0}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Top Customer</span>
                  <p style={{ fontSize: '1rem', fontWeight: 'bold' }}>{customers.sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))[0]?.name || 'N/A'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Most Loyal Customer</span>
                  <p style={{ fontSize: '1rem', fontWeight: 'bold' }}>{customers.sort((a, b) => (b.order_count || 0) - (a.order_count || 0))[0]?.name || 'N/A'} ({customers.sort((a, b) => (b.order_count || 0) - (a.order_count || 0))[0]?.order_count || 0} orders)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* SECURITY TAB */}
      {activeTab === 'security' && (
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px' }}>
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} /> Security Audit Logs
          </h2>
          <div style={{ overflowX: 'auto', maxHeight: '550px', overflowY: 'auto' }}>
            {securityLogs && securityLogs.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6', position: 'sticky', top: 0 }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Timestamp</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Action</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>User</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {securityLogs.map((log, idx) => (
                    <tr key={log.id || idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '0.75rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} color="#9ca3af" />
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ 
                          background: log.action === 'ORDER_COMPLETED' ? '#dbeafe' : 
                                     log.action === 'INVENTORY_UPDATE' ? '#fef3c7' : 
                                     log.action === 'PRODUCT_ADDED' ? '#d1fae5' : 
                                     log.action === 'PRODUCT_DELETED' ? '#fee2e2' : '#f3f4f6',
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '20px', 
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{log.user_email || 'system'}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <Shield size={48} color="#9ca3af" style={{ marginBottom: '1rem' }} />
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>No security logs yet</p>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Security events will appear here when actions are performed</p>
              </div>
            )}
          </div>
          
          {securityLogs && securityLogs.length > 0 && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f3f4f6', borderRadius: '8px', fontSize: '0.75rem', color: '#6b7280' }}>
              Showing last {securityLogs.length} security events
            </div>
          )}
        </div>
      )}
      
      {/* PAST RECORDS MODAL */}
      {showPastRecords && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#f3f4f6',
          zIndex: 2000,
          overflow: 'auto'
        }}>
          <div style={{
            position: 'sticky',
            top: 0,
            background: 'white',
            padding: '1rem',
            borderBottom: '1px solid #e5e7eb',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={24} color="#3b82f6" />
                <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Past Records</h1>
              </div>
              <button onClick={() => setShowPastRecords(false)} style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <X size={16} />
                Close
              </button>
            </div>
          </div>

          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
            {/* Date Selector */}
            <div style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '16px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => changeDate(-1)} style={{
                  background: '#f3f4f6',
                  border: 'none',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>
                  <ChevronLeft size={20} />
                </button>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={18} color="#3b82f6" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      style={{
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <button onClick={() => changeDate(1)} style={{
                  background: '#f3f4f6',
                  border: 'none',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>
                  <ChevronRight size={20} />
                </button>
              </div>
              
              {pastOrders.length > 0 && (
                <button onClick={exportToCSV} style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Download size={16} />
                  Export to CSV
                </button>
              )}
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', padding: '1.25rem', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '0.85rem', opacity: 0.9 }}>Total Transactions</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{pastSummary?.transaction_count || pastOrders.length || 0}</p>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '1.25rem', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '0.85rem', opacity: 0.9 }}>Total Revenue</h3>
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>KSh {pastTotalRevenue.toLocaleString()}</p>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', padding: '1.25rem', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '0.85rem', opacity: 0.9 }}>Average Order</h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>KSh {pastOrders.length ? Math.round(pastTotalRevenue / pastOrders.length).toLocaleString() : 0}</p>
              </div>
            </div>

            {/* Orders Table */}
            <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', overflowX: 'auto' }}>
              <h3 style={{ marginBottom: '1rem' }}>Orders for {new Date(selectedDate).toLocaleDateString()}</h3>
              {pastLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
              ) : pastOrders.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Order #</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Time</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Customer</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Payment</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Items</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastOrders.map(order => (
                      <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.75rem' }}>{order.order_number}</td>
                        <td style={{ padding: '0.75rem' }}>{new Date(order.created_at).toLocaleTimeString()}</td>
                        <td style={{ padding: '0.75rem' }}>{order.customer_name || 'Walk-in Customer'}</td>
                        <td style={{ padding: '0.75rem' }}>{order.payment_method || 'cash'}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>{order.items?.length || 0}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>KSh {(order.total || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot style={{ background: '#f3f4f6' }}>
                    <tr>
                      <td colSpan="5" style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>KSh {pastTotalRevenue.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>No orders found for this date</p>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Select a different date to view records</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;