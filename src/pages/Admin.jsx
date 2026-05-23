import React, { useContext, useState, useEffect, Fragment } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  LayoutDashboard, Package, Plus, Users, Shield, 
  TrendingUp, DollarSign, ShoppingCart, Trash2, 
  UserCheck, Repeat, Clock, FileText, Calendar,
  ChevronLeft, ChevronRight, Download, X, Search,
  Edit, Sparkles, Box, BarChart3,
  Award, TrendingDown, Crown, Medal,
  AlertTriangle, Link
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
    dailyCounter, 
    getInventoryValue, 
    customers, 
    orders,
    securityLogs,
    store,
    loadStoreData
  } = useContext(AppContext);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '', stock: '', image_url: '' });
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
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  
  // Analytics Tab State
  const [analyticsPeriod, setAnalyticsPeriod] = useState('daily');
  const [productRankings, setProductRankings] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [bottomPerformers, setBottomPerformers] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [selectedPeriodDate, setSelectedPeriodDate] = useState(new Date());
  
  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    if (showPastRecords && selectedDate) {
      loadPastRecords(selectedDate);
    }
  }, [showPastRecords, selectedDate]);
  
  useEffect(() => {
    if (activeTab === 'analytics') {
      loadProductAnalytics();
    }
  }, [activeTab, analyticsPeriod, selectedPeriodDate]);
  
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
  
  const loadProductAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const now = new Date(selectedPeriodDate);
      let startDate, endDate;
      
      if (analyticsPeriod === 'daily') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      } else if (analyticsPeriod === 'weekly') {
        const startOfWeek = now.getDate() - now.getDay();
        startDate = new Date(now.getFullYear(), now.getMonth(), startOfWeek);
        endDate = new Date(now.getFullYear(), now.getMonth(), startOfWeek + 7);
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }
      
      const { data: periodOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', store.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      const productSales = {};
      
      (periodOrders || []).forEach(order => {
        if (order.items && order.items.length > 0) {
          order.items.forEach(item => {
            const productName = item.name;
            const category = item.category || 'Uncategorized';
            const quantity = item.quantity;
            const revenue = item.price * quantity;
            
            if (!productSales[productName]) {
              productSales[productName] = {
                name: productName,
                category: category,
                quantity: 0,
                revenue: 0,
                orderCount: 0
              };
            }
            productSales[productName].quantity += quantity;
            productSales[productName].revenue += revenue;
            productSales[productName].orderCount += 1;
          });
        }
      });
      
      const rankings = Object.values(productSales).sort((a, b) => b.quantity - a.quantity);
      setProductRankings(rankings);
      setTopPerformers(rankings.slice(0, 3));
      setBottomPerformers(rankings.slice(-3).reverse());
      
    } catch (error) {
      console.error('Error loading product analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };
  
  const loadPastRecords = async (date) => {
    if (!store) return;
    
    setPastLoading(true);
    try {
      const { data: dailySummary } = await supabase
        .from('daily_sales')
        .select('*')
        .eq('store_id', store.id)
        .eq('sale_date', date)
        .maybeSingle();
      
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
      alert('Please fill all required fields');
      return;
    }
    addNewProduct(newProduct);
    setNewProduct({ name: '', category: '', price: '', stock: '', image_url: '' });
    setImagePreview('');
  };
  
  const handleImageUrlChange = (url) => {
    setNewProduct({...newProduct, image_url: url});
    setImagePreview(url);
  };
  
  const handleEditProduct = (product) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      category: product.category || '',
      price: product.price,
      stock: product.stock,
      image_url: product.image_url || ''
    });
    setIsSaving(false);
  };
  
  const handleSaveEdit = async () => {
    if (!editingProduct || !store) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editingProduct.name,
          category: editingProduct.category,
          price: editingProduct.price,
          stock: editingProduct.stock,
          image_url: editingProduct.image_url
        })
        .eq('id', editingProduct.id)
        .eq('store_id', store.id);
      
      if (error) throw error;
      
      await loadStoreData(store.id);
      
      setEditingProduct(null);
      setIsSaving(false);
      alert('Product updated successfully!');
      
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product: ' + error.message);
      setIsSaving(false);
    }
  };
  
  const exportToCSV = () => {
    if (!pastOrders.length) return;
    
    const headers = ['Order #', 'Time', 'Customer', 'Payment', 'Items', 'Total'];
    const rows = pastOrders.map(order => [
      order.order_number,
      formatTimeOnly(order.created_at),
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
  
  const changeAnalyticsPeriod = (direction) => {
    const newDate = new Date(selectedPeriodDate);
    if (analyticsPeriod === 'daily') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (analyticsPeriod === 'weekly') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setSelectedPeriodDate(newDate);
  };
  
  const pastTotalRevenue = pastOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  
  const filteredCustomers = customers?.filter(customer => 
    customer.name?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );
  
  const tabs = [
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard', color: '#1E3A5F' },
    { id: 'analytics', icon: <BarChart3 size={18} />, label: 'Analytics', color: '#0F766E' },
    { id: 'inventory', icon: <Package size={18} />, label: 'Inventory', color: '#1E3A5F' },
    { id: 'add-product', icon: <Plus size={18} />, label: 'Add Product', color: '#059669' },
    { id: 'customers', icon: <Users size={18} />, label: 'Customers', color: '#1E3A5F' },
    { id: 'security', icon: <Shield size={18} />, label: 'Security', color: '#E11D48' }
  ];
  
  const formatTimeOnly = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const localDate = new Date(date.getTime() + (3 * 60 * 60 * 1000));
    return localDate.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };
  
  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const localDate = new Date(date.getTime() + (3 * 60 * 60 * 1000));
    return localDate.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };
  
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return `${formatDateOnly(dateString)}, ${formatTimeOnly(dateString)}`;
  };
  
  const formatPeriodLabel = () => {
    if (analyticsPeriod === 'daily') {
      return selectedPeriodDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } else if (analyticsPeriod === 'weekly') {
      const startOfWeek = new Date(selectedPeriodDate);
      startOfWeek.setDate(selectedPeriodDate.getDate() - selectedPeriodDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else {
      return selectedPeriodDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    }
  };
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 60px)' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
      </div>
    );
  }
  
  return (
    <div style={{ background: '#F8FAFC', minHeight: 'calc(100vh - 60px)', padding: '1.5rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {tabs.map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)} 
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  background: activeTab === tab.id ? tab.color : 'transparent', 
                  border: activeTab === tab.id ? 'none' : '1.5px solid #E2E8F0',
                  borderRadius: '10px', 
                  cursor: 'pointer', 
                  color: activeTab === tab.id ? 'white' : '#1E293B', 
                  fontWeight: 600, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setShowPastRecords(true)}
            style={{
              background: 'transparent',
              color: '#D97706',
              border: '1.5px solid #D97706',
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 600
            }}
          >
            <FileText size={18} /> Past Records
          </button>
        </div>
        
        {/* DASHBOARD TAB - Simplified */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="card" style={{ borderLeft: '4px solid #1E3A5F' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>Today's Orders</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1E3A5F' }}>{dailyCounter || 0}</p>
                    <small style={{ color: '#94A3B8', fontSize: '0.7rem' }}>{dailyReport?.transactionCount || 0} transactions</small>
                  </div>
                  <div style={{ background: 'rgba(30, 58, 95, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                    <ShoppingCart size={24} color="#1E3A5F" />
                  </div>
                </div>
              </div>
              
              <div className="card" style={{ borderLeft: '4px solid #059669' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>Today's Revenue</h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#059669' }}>KES {(dailyReport?.totalRevenue || 0).toLocaleString()}</p>
                  </div>
                  <div style={{ background: 'rgba(5, 150, 105, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                    <TrendingUp size={24} color="#059669" />
                  </div>
                </div>
              </div>
              
              <div className="card" style={{ borderLeft: '4px solid #0F766E' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>Total Revenue</h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0F766E' }}>KES {(analytics?.totalRevenue || 0).toLocaleString()}</p>
                  </div>
                  <div style={{ background: 'rgba(15, 118, 110, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                    <DollarSign size={24} color="#0F766E" />
                  </div>
                </div>
              </div>
              
              <div className="card" style={{ borderLeft: '4px solid #D97706' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>Inventory Value</h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#D97706' }}>KES {(getInventoryValue() || 0).toLocaleString()}</p>
                  </div>
                  <div style={{ background: 'rgba(217, 119, 6, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                    <Package size={24} color="#D97706" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <h3 style={{ marginBottom: '1rem', color: '#1E3A5F' }}><Clock size={18} /> Today's Transactions</h3>
              <div style={{ overflowX: 'auto' }}>
                {dailyReport?.transactions && dailyReport.transactions.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr><th style={{ padding: '0.75rem', textAlign: 'left', background: '#F1F5F9' }}>Order #</th><th style={{ padding: '0.75rem', textAlign: 'left', background: '#F1F5F9' }}>Time</th><th style={{ padding: '0.75rem', textAlign: 'left', background: '#F1F5F9' }}>Customer</th><th style={{ padding: '0.75rem', textAlign: 'left', background: '#F1F5F9' }}>Payment</th><th style={{ padding: '0.75rem', textAlign: 'right', background: '#F1F5F9' }}>Total</th></tr>
                    </thead>
                    <tbody>
                      {dailyReport.transactions.map((t, idx) => (
                        <tr key={t.id || idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                          <td style={{ padding: '0.75rem' }}>{t.orderNumber}</td>
                          <td style={{ padding: '0.75rem' }}>{formatTimeOnly(t.time)}</td>
                          <td style={{ padding: '0.75rem' }}>{t.customerName || 'Walk-in Customer'}</td>
                          <td style={{ padding: '0.75rem' }}><span style={{ background: '#E0F2FE', color: '#0284C7', padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem' }}>{t.paymentMethod || 'cash'}</span></td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>KES {(t.total || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>No transactions today</div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setAnalyticsPeriod('daily')} className={analyticsPeriod === 'daily' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Daily</button>
                  <button onClick={() => setAnalyticsPeriod('weekly')} className={analyticsPeriod === 'weekly' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Weekly</button>
                  <button onClick={() => setAnalyticsPeriod('monthly')} className={analyticsPeriod === 'monthly' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Monthly</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button onClick={() => changeAnalyticsPeriod(-1)} className="btn-secondary" style={{ padding: '0.5rem' }}><ChevronLeft size={20} /></button>
                  <span style={{ fontWeight: 600 }}>{formatPeriodLabel()}</span>
                  <button onClick={() => changeAnalyticsPeriod(1)} className="btn-secondary" style={{ padding: '0.5rem' }}><ChevronRight size={20} /></button>
                </div>
              </div>
            </div>
            
            {analyticsLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
            ) : (
              <>
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ marginBottom: '1rem', color: '#D97706' }}><Crown size={20} /> Top 3 Performing Products</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {productRankings[0] && (
                      <div style={{ textAlign: 'center', padding: '1rem', background: 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)', borderRadius: '16px' }}>
                        <Crown size={32} color="#FBBF24" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FBBF24' }}>#1</div>
                        <div style={{ fontWeight: 'bold' }}>{productRankings[0].name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#D97706', marginTop: '0.25rem' }}>{productRankings[0].category}</div>
                        <div style={{ marginTop: '0.75rem', background: 'white', padding: '0.5rem', borderRadius: '12px' }}>
                          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Units Sold</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FBBF24' }}>{productRankings[0].quantity}</div>
                        </div>
                        <div style={{ marginTop: '0.5rem' }}>
                          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Revenue</div>
                          <div style={{ fontWeight: 'bold' }}>KES {productRankings[0].revenue.toLocaleString()}</div>
                        </div>
                      </div>
                    )}
                    {productRankings[1] && (
                      <div style={{ textAlign: 'center', padding: '1rem', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <Medal size={32} color="#94A3B8" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#94A3B8' }}>#2</div>
                        <div style={{ fontWeight: 'bold' }}>{productRankings[1].name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.25rem' }}>{productRankings[1].category}</div>
                        <div style={{ marginTop: '0.75rem', background: 'white', padding: '0.5rem', borderRadius: '12px' }}>
                          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Units Sold</div>
                          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#94A3B8' }}>{productRankings[1].quantity}</div>
                        </div>
                        <div style={{ marginTop: '0.5rem' }}>
                          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Revenue</div>
                          <div style={{ fontWeight: 'bold' }}>KES {productRankings[1].revenue.toLocaleString()}</div>
                        </div>
                      </div>
                    )}
                    {productRankings[2] && (
                      <div style={{ textAlign: 'center', padding: '1rem', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <Medal size={32} color="#CD7F32" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#CD7F32' }}>#3</div>
                        <div style={{ fontWeight: 'bold' }}>{productRankings[2].name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.25rem' }}>{productRankings[2].category}</div>
                        <div style={{ marginTop: '0.75rem', background: 'white', padding: '0.5rem', borderRadius: '12px' }}>
                          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Units Sold</div>
                          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#CD7F32' }}>{productRankings[2].quantity}</div>
                        </div>
                        <div style={{ marginTop: '0.5rem' }}>
                          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Revenue</div>
                          <div style={{ fontWeight: 'bold' }}>KES {productRankings[2].revenue.toLocaleString()}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="card">
                  <h3 style={{ marginBottom: '1rem', color: '#1E3A5F' }}>Complete Product Rankings</h3>
                  <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
                    {productRankings.length > 0 ? (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#F1F5F9', position: 'sticky', top: 0 }}>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Rank</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Product</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Category</th>
                            <th style={{ padding: '0.75rem', textAlign: 'center' }}>Units Sold</th>
                            <th style={{ padding: '0.75rem', textAlign: 'center' }}>Orders</th>
                            <th style={{ padding: '0.75rem', textAlign: 'right' }}>Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productRankings.map((product, idx) => (
                            <tr key={product.name} style={{ borderBottom: '1px solid #E2E8F0' }}>
                              <td style={{ padding: '0.75rem' }}>{idx === 0 ? <Crown size={16} color="#FBBF24" /> : idx === 1 ? <Medal size={16} color="#94A3B8" /> : idx === 2 ? <Medal size={16} color="#CD7F32" /> : `#${idx + 1}`}</td>
                              <td style={{ padding: '0.75rem', fontWeight: 600 }}>{product.name}</td>
                              <td style={{ padding: '0.75rem' }}><span style={{ background: '#E0F2FE', color: '#0284C7', padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem' }}>{product.category}</span></td>
                              <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: idx < 3 ? 'bold' : 'normal', color: idx === 0 ? '#FBBF24' : idx === 1 ? '#94A3B8' : idx === 2 ? '#CD7F32' : 'inherit' }}>{product.quantity}</td>
                              <td style={{ padding: '0.75rem', textAlign: 'center' }}>{product.orderCount}</td>
                              <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: '#059669' }}>KES {product.revenue.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot style={{ background: '#F1F5F9' }}>
                          <tr>
                            <td colSpan="5" style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>Total Revenue:</td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: '#059669' }}>KES {productRankings.reduce((sum, p) => sum + p.revenue, 0).toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>No sales data available</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        
        {/* INVENTORY TAB - Simplified */}
        {activeTab === 'inventory' && (
          <div>
            <div className="card">
              <h2 style={{ marginBottom: '1rem', color: '#1E3A5F' }}><Package size={20} /> Current Inventory</h2>
              <div style={{ overflowX: 'auto' }}>
                {products && products.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F1F5F9' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Image</th><th style={{ padding: '0.75rem', textAlign: 'left' }}>Product</th><th style={{ padding: '0.75rem', textAlign: 'left' }}>Category</th><th style={{ padding: '0.75rem', textAlign: 'right' }}>Price</th><th style={{ padding: '0.75rem', textAlign: 'center' }}>Stock</th><th style={{ padding: '0.75rem', textAlign: 'right' }}>Value</th><th style={{ padding: '0.75rem', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                          <td style={{ padding: '0.75rem' }}>
                            {product.image_url ? 
                              <img src={product.image_url} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} /> : 
                              <div style={{ width: '40px', height: '40px', background: '#F1F5F9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Box size={20} color="#94A3B8" /></div>
                            }
                          </td>
                          <td style={{ padding: '0.75rem', fontWeight: 600 }}>{product.name}</td>
                          <td style={{ padding: '0.75rem' }}><span style={{ background: '#E0F2FE', color: '#0284C7', padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem' }}>{product.category}</span></td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>KES {(product.price || 0).toLocaleString()}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <input type="number" value={product.stock || 0} onChange={(e) => updateInventory(product.id, parseInt(e.target.value))} style={{ width: '80px', padding: '0.5rem', textAlign: 'center', borderRadius: '8px', background: '#F1F5F9', border: `1px solid ${product.stock < 10 ? '#E11D48' : '#E2E8F0'}`, color: '#1E293B' }} />
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>KES {((product.price || 0) * (product.stock || 0)).toLocaleString()}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <button onClick={() => handleEditProduct(product)} style={{ background: '#E0F2FE', color: '#0284C7', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', marginRight: '0.5rem' }}><Edit size={16} /></button>
                            <button onClick={() => deleteProduct(product.id)} style={{ background: '#FEE2E2', color: '#E11D48', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot style={{ background: '#F1F5F9' }}>
                      <tr>
                        <td colSpan="5" style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>Total Inventory Value:</td>
                        <td colSpan="2" style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: '#D97706' }}>KES {(getInventoryValue() || 0).toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>No products found. Add some products to get started.</div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* ADD PRODUCT TAB */}
        {activeTab === 'add-product' && (
          <div>
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <h2 style={{ marginBottom: '1.5rem', color: '#059669' }}><Plus size={20} /> Add New Product</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="text" placeholder="Product Name *" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="input-modern" />
                <input type="text" placeholder="Category (e.g., Electronics, Clothing, Food)" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} className="input-modern" />
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Link size={14} /> Product Image URL (Optional)</label>
                  <input type="url" placeholder="https://example.com/product-image.jpg" value={newProduct.image_url} onChange={(e) => handleImageUrlChange(e.target.value)} className="input-modern" />
                  <p style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.25rem' }}>Paste a direct image URL from the web</p>
                  {imagePreview && (
                    <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: '#F1F5F9', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img src={imagePreview} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div><div style={{ fontSize: '0.75rem', color: '#059669' }}>Preview</div><div style={{ fontSize: '0.7rem', color: '#64748B' }}>Image will appear on product card</div></div>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input type="number" placeholder="Price (KES) *" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} className="input-modern" />
                  <input type="number" placeholder="Stock Quantity *" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} className="input-modern" />
                </div>
                <button onClick={handleAddProduct} style={{ background: '#059669', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <Plus size={16} /> Add Product
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* CUSTOMERS TAB - Simplified */}
        {activeTab === 'customers' && (
          <div>
            <div className="card">
              <h2 style={{ marginBottom: '1rem', color: '#1E3A5F' }}><Users size={20} /> Customer Analytics</h2>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input type="text" placeholder="Search by customer name or phone..." value={customerSearchTerm} onChange={(e) => setCustomerSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', border: '1px solid #E2E8F0', borderRadius: '10px' }} />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ textAlign: 'center', padding: '1rem', background: '#EFF6FF', borderRadius: '12px' }}>
                  <UserCheck size={24} color="#3B82F6" style={{ marginBottom: '0.5rem' }} />
                  <h4 style={{ fontSize: '0.85rem', color: '#64748B' }}>Total Customers</h4>
                  <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#3B82F6' }}>{filteredCustomers?.length || 0}</p>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', background: '#ECFDF5', borderRadius: '12px' }}>
                  <Repeat size={24} color="#10B981" style={{ marginBottom: '0.5rem' }} />
                  <h4 style={{ fontSize: '0.85rem', color: '#64748B' }}>Repeat Customers</h4>
                  <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10B981' }}>{analytics?.repeatCustomers || 0}</p>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', background: '#FFFBEB', borderRadius: '12px' }}>
                  <DollarSign size={24} color="#D97706" style={{ marginBottom: '0.5rem' }} />
                  <h4 style={{ fontSize: '0.85rem', color: '#64748B' }}>Avg Order Value</h4>
                  <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#D97706' }}>KES {analytics?.averageOrderValue || 0}</p>
                </div>
              </div>
              
              <h3 style={{ marginBottom: '1rem', color: '#1E3A5F' }}>Customer List</h3>
              <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
                {filteredCustomers && filteredCustomers.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F1F5F9', position: 'sticky', top: 0 }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>#</th><th style={{ padding: '0.75rem', textAlign: 'left' }}>Name</th><th style={{ padding: '0.75rem', textAlign: 'left' }}>Phone</th><th style={{ padding: '0.75rem', textAlign: 'right' }}>Total Spent</th><th style={{ padding: '0.75rem', textAlign: 'center' }}>Orders</th><th style={{ padding: '0.75rem', textAlign: 'left' }}>Last Order</th><th style={{ padding: '0.75rem', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((c, idx) => {
                        const customerOrders = orders.filter(o => o.customer_phone === c.phone || o.customer_name === c.name).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                        const isExpanded = expandedCustomer === c.id;
                        return (
                          <React.Fragment key={c.id || idx}>
                            <tr>
                              <td style={{ padding: '0.75rem' }}>{idx + 1}</td>
                              <td style={{ padding: '0.75rem', fontWeight: 600 }}>{c.name}</td>
                              <td style={{ padding: '0.75rem' }}>{c.phone}</td>
                              <td style={{ padding: '0.75rem', textAlign: 'right' }}>KES {(c.total_spent || 0).toLocaleString()}</td>
                              <td style={{ padding: '0.75rem', textAlign: 'center' }}><span style={{ background: '#E0F2FE', color: '#0284C7', padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem' }}>{c.order_count || 0}</span></td>
                              <td style={{ padding: '0.75rem' }}>{c.last_order ? formatDateOnly(c.last_order) : 'N/A'}</td>
                              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                {customerOrders.length > 0 && (
                                  <button onClick={() => setExpandedCustomer(isExpanded ? null : c.id)} style={{ background: 'transparent', border: '1px solid #1E3A5F', color: '#1E3A5F', padding: '0.25rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem' }}>
                                    {isExpanded ? 'Hide' : 'View Orders'}
                                  </button>
                                )}
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr>
                                <td colSpan="7" style={{ padding: '1rem', background: '#F8FAFC' }}>
                                  <div>
                                    <h4 style={{ marginBottom: '0.75rem', color: '#1E3A5F' }}>Order History - {c.name}</h4>
                                    {customerOrders.map((order) => (
                                      <div key={order.id} style={{ background: 'white', borderRadius: '12px', marginBottom: '1rem', padding: '1rem', border: '1px solid #E2E8F0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #E2E8F0' }}>
                                          <div><strong>Order #{order.order_number}</strong><span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', color: '#64748B' }}>{formatDateTime(order.created_at)}</span></div>
                                          <span style={{ background: '#E0F2FE', color: '#0284C7', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.7rem' }}>{order.payment_method?.toUpperCase() || 'CASH'}</span>
                                        </div>
                                        <div style={{ overflowX: 'auto' }}>
                                          <table style={{ width: '100%', fontSize: '0.85rem' }}>
                                            <thead>
                                              <tr style={{ background: '#F1F5F9' }}>
                                                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Item</th>
                                                <th style={{ padding: '0.5rem', textAlign: 'center' }}>Qty</th>
                                                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Price</th>
                                                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Subtotal</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {order.items && order.items.map((item, itemIdx) => (
                                                <tr key={itemIdx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                                                  <td style={{ padding: '0.5rem' }}>{item.name}</td>
                                                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                                  <td style={{ textAlign: 'right' }}>KES {item.price.toLocaleString()}</td>
                                                  <td style={{ textAlign: 'right' }}>KES {(item.price * item.quantity).toLocaleString()}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                            <tfoot>
                                              <tr style={{ background: '#F1F5F9' }}>
                                                <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
                                                <td style={{ fontWeight: 'bold', color: '#059669' }}>KES {(order.total || 0).toLocaleString()}</td>
                                              </tr>
                                            </tfoot>
                                          </table>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>No customers found</div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <div>
            <div className="card">
              <h2 style={{ marginBottom: '1rem', color: '#E11D48' }}><Shield size={20} /> Security Audit Logs</h2>
              <div style={{ overflowX: 'auto', maxHeight: '550px', overflowY: 'auto' }}>
                {securityLogs && securityLogs.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F1F5F9', position: 'sticky', top: 0 }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Timestamp</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Action</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>User</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {securityLogs.map((log, idx) => (
                        <tr key={log.id || idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                          <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>{formatDateTime(log.created_at)}</td>
                          <td style={{ padding: '0.75rem' }}>
                            <span style={{ 
                              background: log.action === 'ORDER_COMPLETED' ? '#D1FAE5' : log.action === 'INVENTORY_UPDATE' ? '#DBEAFE' : log.action === 'PRODUCT_ADDED' ? '#FEF3C7' : '#FEE2E2',
                              color: log.action === 'ORDER_COMPLETED' ? '#059669' : log.action === 'INVENTORY_UPDATE' ? '#1D4ED8' : log.action === 'PRODUCT_ADDED' ? '#D97706' : '#E11D48',
                              padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500
                            }}>
                              {log.action}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem' }}>{log.user_email || 'system'}</td>
                          <td style={{ padding: '0.75rem' }}>{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>No security logs yet</div>
                )}
              </div>
              {securityLogs && securityLogs.length > 0 && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#F1F5F9', borderRadius: '8px', fontSize: '0.75rem', color: '#64748B' }}>Showing last {securityLogs.length} security events</div>
              )}
            </div>
          </div>
        )}
        
        {/* PAST RECORDS MODAL - Simplified */}
        {showPastRecords && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, overflow: 'auto' }}>
            <div style={{ position: 'sticky', top: 0, background: 'white', padding: '1rem', borderBottom: '1px solid #E2E8F0', zIndex: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
                <div><FileText size={24} color="#D97706" /><h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'inline', marginLeft: '0.5rem', color: '#D97706' }}>Past Records</h1></div>
                <button onClick={() => setShowPastRecords(false)} style={{ background: '#FEE2E2', color: '#E11D48', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>Close</button>
              </div>
            </div>
            
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => changeDate(-1)} style={{ background: '#F1F5F9', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}><ChevronLeft size={20} /></button>
                    <div><Calendar size={18} color="#D97706" style={{ display: 'inline', marginRight: '0.5rem' }} /><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ padding: '0.5rem', border: '1px solid #E2E8F0', borderRadius: '8px' }} /></div>
                    <button onClick={() => changeDate(1)} style={{ background: '#F1F5F9', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}><ChevronRight size={20} /></button>
                  </div>
                  {pastOrders.length > 0 && <button onClick={exportToCSV} style={{ background: '#059669', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}><Download size={16} /> Export CSV</button>}
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="card"><h3 style={{ fontSize: '0.85rem', color: '#64748B' }}>Total Transactions</h3><p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#D97706' }}>{pastSummary?.transaction_count || pastOrders.length || 0}</p></div>
                <div className="card"><h3 style={{ fontSize: '0.85rem', color: '#64748B' }}>Total Revenue</h3><p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#059669' }}>KES {pastTotalRevenue.toLocaleString()}</p></div>
                <div className="card"><h3 style={{ fontSize: '0.85rem', color: '#64748B' }}>Average Order</h3><p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1E3A5F' }}>KES {pastOrders.length ? Math.round(pastTotalRevenue / pastOrders.length).toLocaleString() : 0}</p></div>
              </div>
              
              <div className="card">
                <h3 style={{ marginBottom: '1rem', color: '#D97706' }}>Orders for {formatDateOnly(selectedDate)}</h3>
                <div style={{ overflowX: 'auto' }}>
                  {pastLoading ? <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner"></div></div> : pastOrders.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#F1F5F9' }}>
                          <th style={{ padding: '0.75rem', textAlign: 'left' }}>Order #</th><th style={{ padding: '0.75rem', textAlign: 'left' }}>Time</th><th style={{ padding: '0.75rem', textAlign: 'left' }}>Customer</th><th style={{ padding: '0.75rem', textAlign: 'left' }}>Payment</th><th style={{ padding: '0.75rem', textAlign: 'center' }}>Items</th><th style={{ padding: '0.75rem', textAlign: 'right' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pastOrders.map(order => (
                          <tr key={order.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                            <td style={{ padding: '0.75rem' }}>{order.order_number}</td>
                            <td style={{ padding: '0.75rem' }}>{formatTimeOnly(order.created_at)}</td>
                            <td style={{ padding: '0.75rem' }}>{order.customer_name || 'Walk-in Customer'}</td>
                            <td style={{ padding: '0.75rem' }}><span style={{ background: '#E0F2FE', color: '#0284C7', padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem' }}>{order.payment_method || 'cash'}</span></td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>{order.items?.length || 0}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>KES {(order.total || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot style={{ background: '#F1F5F9' }}>
                        <tr><td colSpan="5" style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>Total:</td><td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: '#059669' }}>KES {pastTotalRevenue.toLocaleString()}</td></tr>
                      </tfoot>
                    </table>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>No orders found for this date</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;