import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  LayoutDashboard, Package, Plus, Users, Shield, 
  TrendingUp, DollarSign, ShoppingCart,
  Trash2, Mail, Lock, LogIn
} from 'lucide-react';

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
    projectedEarnings,
    customers
  } = useContext(AppContext);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '', stock: '' });
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 769);
  const analytics = getSalesAnalytics();
  const dailyReport = getDailyReport();
  
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 769);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      alert('Please fill all fields');
      return;
    }
    addNewProduct(newProduct, selectedImage);
    setNewProduct({ name: '', category: '', price: '', stock: '' });
    setSelectedImage(null);
  };
  
  const tabs = [
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard', shortLabel: 'Dash' },
    { id: 'inventory', icon: <Package size={18} />, label: 'Inventory', shortLabel: 'Inv' },
    { id: 'add-product', icon: <Plus size={18} />, label: 'Add Product', shortLabel: 'Add' },
    { id: 'customers', icon: <Users size={18} />, label: 'Customers', shortLabel: 'Cust' },
    { id: 'security', icon: <Shield size={18} />, label: 'Security', shortLabel: 'Sec' }
  ];
  
  return (
    <div style={{ padding: '1rem', maxWidth: '1400px', margin: '0 auto', width: '100%', background: '#f3f4f6', minHeight: 'calc(100vh - 60px)' }}>
      {/* Desktop Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        background: 'white',
        padding: '0.5rem',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }} className="desktop-tabs">
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
              fontSize: '0.9rem',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* Mobile Tabs - Horizontal Scroll */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem',
        overflowX: 'auto',
        overflowY: 'hidden',
        paddingBottom: '0.5rem',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'thin',
        background: 'white',
        padding: '0.5rem',
        borderRadius: '12px'
      }} className="mobile-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.6rem 1rem',
              background: activeTab === tab.id ? '#3b82f6' : '#f3f4f6',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              color: activeTab === tab.id ? 'white' : '#4b5563',
              fontWeight: 500,
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {tab.icon}
            <span>{tab.shortLabel}</span>
          </button>
        ))}
      </div>
      
      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', padding: '1.25rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '0.85rem', opacity: 0.9 }}>Today's Counter</h3>
                <ShoppingCart size={20} opacity={0.8} />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>#{dailyCounter}</p>
              <small>{dailyReport.transactionCount} transactions</small>
            </div>
            <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '0.85rem', color: '#6b7280' }}>Today's Revenue</h3>
                <DollarSign size={20} color="#10b981" />
              </div>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>KSh {dailyReport.totalRevenue.toLocaleString()}</p>
            </div>
            <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '0.85rem', color: '#6b7280' }}>Total Revenue</h3>
                <TrendingUp size={20} color="#3b82f6" />
              </div>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>KSh {analytics.totalRevenue.toLocaleString()}</p>
            </div>
            <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '0.85rem', color: '#6b7280' }}>Inventory Value</h3>
                <Package size={20} color="#f59e0b" />
              </div>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>KSh {projectedEarnings.inventoryValue?.toLocaleString()}</p>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} /> Projected Earnings
              </h3>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Daily:</span>
                  <strong>KSh {projectedEarnings.daily.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Weekly:</span>
                  <strong>KSh {projectedEarnings.weekly.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Monthly:</span>
                  <strong>KSh {projectedEarnings.monthly.toLocaleString()}</strong>
                </div>
              </div>
            </div>
            <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} /> Top Selling Products
              </h3>
              <ul style={{ paddingLeft: '1rem' }}>
                {analytics.topProducts.slice(0, 5).map(([name, qty]) => (
                  <li key={name} style={{ marginBottom: '0.5rem' }}>{name}: <strong>{qty} units</strong></li>
                ))}
              </ul>
            </div>
          </div>
          
          <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
            <h3 style={{ marginBottom: '1rem' }}>Today's Transactions</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Order #</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Time</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Customer</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Payment</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {dailyReport.transactions.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem' }}>{t.orderNumber}</td>
                    <td style={{ padding: '0.75rem' }}>{t.time}</td>
                    <td style={{ padding: '0.75rem' }}>{t.customerName}</td>
                    <td style={{ padding: '0.75rem' }}>{t.paymentMethod}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>KSh {t.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* INVENTORY TAB */}
      {activeTab === 'inventory' && (
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={20} /> Current Inventory
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
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
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>KSh {product.price.toLocaleString()}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <input
                      type="number"
                      value={product.stock}
                      onChange={(e) => updateInventory(product.id, parseInt(e.target.value))}
                      style={{ width: '80px', padding: '0.5rem', textAlign: 'center', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>KSh {(product.price * product.stock).toLocaleString()}</td>
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
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>KSh {products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
      
      {/* ADD PRODUCT TAB */}
      {activeTab === 'add-product' && (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} /> Add New Product
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="text" placeholder="Product Name *" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} style={{ padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '16px' }} />
            <input type="text" placeholder="Category *" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} style={{ padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '16px' }} />
            <input type="number" placeholder="Price (KSh) *" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} style={{ padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '16px' }} />
            <input type="number" placeholder="Stock Quantity *" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} style={{ padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '16px' }} />
            <div>
              <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>Product Image (optional)</label>
              <input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files[0])} style={{ marginTop: '0.5rem', display: 'block' }} />
            </div>
            <button onClick={handleAddProduct} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}>
              Add Product
            </button>
          </div>
        </div>
      )}
      
      {/* CUSTOMERS TAB */}
      {activeTab === 'customers' && (
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} /> Customer Analytics
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#6b7280' }}>Total Customers</h4>
              <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#3b82f6' }}>{customers.length}</p>
            </div>
            <div style={{ background: '#ecfdf5', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#6b7280' }}>Repeat Customers</h4>
              <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981' }}>{analytics.repeatCustomers}</p>
            </div>
            <div style={{ background: '#fffbeb', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#6b7280' }}>Avg Order Value</h4>
              <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#f59e0b' }}>KSh {analytics.averageOrderValue}</p>
            </div>
          </div>
          
          <h3 style={{ marginBottom: '0.75rem' }}>Customer List</h3>
          <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', position: 'sticky', top: 0 }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Phone</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total Spent</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Orders</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.phone} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem' }}>{c.name}</td>
                    <td style={{ padding: '0.75rem' }}>{c.phone}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>KSh {c.totalSpent.toLocaleString()}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{c.orderCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* SECURITY TAB */}
      {activeTab === 'security' && (
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} /> Security Audit Logs
          </h2>
          <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
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
                {getSecurityLogs(200).map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ background: log.action.includes('ORDER') ? '#dbeafe' : '#fee2e2', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>{log.user}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <style>
        {`
          @media (max-width: 768px) {
            .desktop-tabs {
              display: none !important;
            }
          }
          @media (min-width: 769px) {
            .mobile-tabs {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Admin;