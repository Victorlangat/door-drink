import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

const Admin = () => {
  const { 
    products, 
    updateInventory, 
    addNewProduct, 
    updateProductImage,
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
  const analytics = getSalesAnalytics();
  const dailyReport = getDailyReport();
  
  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      alert('Please fill all fields');
      return;
    }
    addNewProduct(newProduct, selectedImage);
    setNewProduct({ name: '', category: '', price: '', stock: '' });
    setSelectedImage(null);
  };
  
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <h1>🔐 Admin Dashboard - Inventory Management</h1>
      
      <div style={{ display: 'flex', gap: '1rem', margin: '2rem 0', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        {['dashboard', 'inventory', 'add-product', 'customers', 'security'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '0.75rem 1.5rem', background: activeTab === tab ? '#2196F3' : 'transparent', border: 'none', borderRadius: '5px', cursor: 'pointer', color: activeTab === tab ? 'white' : '#333', fontWeight: 'bold' }}>
            {tab === 'dashboard' ? '📊 Dashboard' : tab === 'inventory' ? '📦 Inventory' : tab === 'add-product' ? '➕ Add Product' : tab === 'customers' ? '👥 Customers' : '🔒 Security'}
          </button>
        ))}
      </div>
      
      {/* DASHBOARD */}
      {activeTab === 'dashboard' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '1.5rem', borderRadius: '10px' }}>
              <h3>Today's Counter</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>#{dailyCounter}</p>
              <small>{dailyReport.transactionCount} transactions</small>
            </div>
            <div style={{ background: '#e8f5e9', padding: '1.5rem', borderRadius: '10px' }}>
              <h3>Today's Revenue</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2e7d32' }}>KSh {dailyReport.totalRevenue.toLocaleString()}</p>
            </div>
            <div style={{ background: '#e3f2fd', padding: '1.5rem', borderRadius: '10px' }}>
              <h3>Total Revenue</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1565c0' }}>KSh {analytics.totalRevenue.toLocaleString()}</p>
            </div>
            <div style={{ background: '#fff3e0', padding: '1.5rem', borderRadius: '10px' }}>
              <h3>Inventory Value</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e65100' }}>KSh {projectedEarnings.inventoryValue?.toLocaleString()}</p>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3>📈 Projected Earnings</h3>
              <div style={{ marginTop: '1rem' }}>
                <p><strong>Daily Projection:</strong> KSh {projectedEarnings.daily.toLocaleString()}</p>
                <p><strong>Weekly Projection:</strong> KSh {projectedEarnings.weekly.toLocaleString()}</p>
                <p><strong>Monthly Projection:</strong> KSh {projectedEarnings.monthly.toLocaleString()}</p>
              </div>
            </div>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3>🏆 Top Selling Products</h3>
              <ul style={{ marginTop: '1rem' }}>
                {analytics.topProducts.map(([name, qty]) => (
                  <li key={name}>{name}: {qty} units</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>📋 Today's Transactions</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: '0.75rem' }}>Order #</th><th style={{ padding: '0.75rem' }}>Time</th><th style={{ padding: '0.75rem' }}>Customer</th><th style={{ padding: '0.75rem' }}>Payment</th><th style={{ padding: '0.75rem', textAlign: 'right' }}>Total</th>
                </tr></thead>
                <tbody>
                  {dailyReport.transactions.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
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
        </>
      )}
      
      {/* INVENTORY TAB */}
      {activeTab === 'inventory' && (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2>📦 Current Inventory</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: '0.75rem' }}>Image</th><th style={{ padding: '0.75rem' }}>Product</th><th style={{ padding: '0.75rem' }}>Category</th><th style={{ padding: '0.75rem', textAlign: 'right' }}>Price</th><th style={{ padding: '0.75rem', textAlign: 'center' }}>Stock</th><th style={{ padding: '0.75rem', textAlign: 'right' }}>Value</th><th style={{ padding: '0.75rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '0.75rem' }}>
                      {product.image ? <img src={product.image} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }} /> : '📷'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>{product.name}</td>
                    <td style={{ padding: '0.75rem' }}>{product.category}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>KSh {product.price}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <input type="number" value={product.stock} onChange={(e) => updateInventory(product.id, parseInt(e.target.value))} style={{ width: '80px', padding: '0.25rem', textAlign: 'center' }} />
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>KSh {(product.price * product.stock).toLocaleString()}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <button onClick={() => deleteProduct(product.id)} style={{ background: '#f44336', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '5px', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot style={{ background: '#f5f5f5', fontWeight: 'bold' }}>
                <tr><td colSpan="5" style={{ padding: '0.75rem', textAlign: 'right' }}>Total Inventory Value:</td><td style={{ padding: '0.75rem', textAlign: 'right' }}>KSh {products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}</td><td></td></tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
      
      {/* ADD PRODUCT TAB */}
      {activeTab === 'add-product' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '600px', margin: '0 auto' }}>
          <h2>➕ Add New Product</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            <input type="text" placeholder="Product Name *" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '5px' }} />
            <input type="text" placeholder="Category *" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '5px' }} />
            <input type="number" placeholder="Price (KSh) *" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '5px' }} />
            <input type="number" placeholder="Stock Quantity *" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '5px' }} />
            <div>
              <label>Product Image (optional)</label>
              <input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files[0])} style={{ marginTop: '0.5rem', display: 'block' }} />
            </div>
            <button onClick={handleAddProduct} style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem' }}>Add Product</button>
          </div>
        </div>
      )}
      
      {/* CUSTOMERS TAB */}
      {activeTab === 'customers' && (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2>👥 Customer Analytics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '10px' }}>
              <h4>Total Customers</h4>
              <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{customers.length}</p>
            </div>
            <div style={{ background: '#e8f5e9', padding: '1rem', borderRadius: '10px' }}>
              <h4>Repeat Customers</h4>
              <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{analytics.repeatCustomers}</p>
            </div>
            <div style={{ background: '#fff3e0', padding: '1rem', borderRadius: '10px' }}>
              <h4>Avg Order Value</h4>
              <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>KSh {analytics.averageOrderValue}</p>
            </div>
          </div>
          
          <h3>Customer List</h3>
          <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f5f5f5', position: 'sticky', top: 0 }}>
                <th style={{ padding: '0.75rem' }}>Name</th><th style={{ padding: '0.75rem' }}>Phone</th><th style={{ padding: '0.75rem', textAlign: 'right' }}>Total Spent</th><th style={{ padding: '0.75rem', textAlign: 'center' }}>Orders</th>
              </tr></thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.phone} style={{ borderBottom: '1px solid #eee' }}>
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
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2>🔒 Security Audit Logs</h2>
          <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f5f5f5', position: 'sticky', top: 0 }}>
                <th style={{ padding: '0.75rem' }}>Timestamp</th><th style={{ padding: '0.75rem' }}>Action</th><th style={{ padding: '0.75rem' }}>User</th><th style={{ padding: '0.75rem' }}>Details</th>
              </tr></thead>
              <tbody>
                {getSecurityLogs(200).map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                    <td style={{ padding: '0.75rem' }}><span style={{ background: log.action.includes('ORDER') ? '#e3f2fd' : '#fce4ec', padding: '0.25rem 0.5rem', borderRadius: '5px', fontSize: '0.8rem' }}>{log.action}</span></td>
                    <td style={{ padding: '0.75rem' }}>{log.user}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;