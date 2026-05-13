import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Search, Filter, Plus, Minus, Trash2, CreditCard, Smartphone, Wallet, X, ShoppingCart, Package } from 'lucide-react';

const POS = () => {
  const { 
    products, 
    cart, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal, 
    getCartCount, 
    processOrder,
    dailyCounter
  } = useContext(AppContext);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 769);
  
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 769);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const categories = ['all', ...new Set(products.map(p => p.category))];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.stock > 0;
  });
  
  const handleProcessOrder = () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    
    const success = processOrder(paymentMethod, customerName, customerPhone);
    if (success) {
      setLastOrder({
        orderNumber: `POS-${String(dailyCounter).padStart(4, '0')}`,
        items: [...cart],
        total: getCartTotal(),
        paymentMethod,
        customerName: customerName || 'Walk-in Customer',
        time: new Date().toLocaleString()
      });
      setShowReceipt(true);
      setCustomerName('');
      setCustomerPhone('');
      if (!isDesktop) setShowCart(false);
      setTimeout(() => setShowReceipt(false), 5000);
    }
  };
  // Add this new component inside POS.jsx - above the main return

const SellerAnalytics = ({ liveStats, topProducts }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!liveStats) return null;
  
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      marginBottom: '1rem',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '0.75rem 1rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={18} />
          <span style={{ fontWeight: 600 }}>Today's Performance</span>
        </div>
        <span>{expanded ? '▼' : '▲'}</span>
      </div>
      
      {expanded && (
        <div style={{ padding: '1rem' }}>
          {/* Today's Stats */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div style={{ textAlign: 'center', padding: '0.75rem', background: '#f3f4f6', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Today's Sales</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#10b981' }}>KSh {liveStats.todayRevenue.toLocaleString()}</div>
            </div>
            <div style={{ textAlign: 'center', padding: '0.75rem', background: '#f3f4f6', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Transactions</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#3b82f6' }}>{liveStats.todayTransactions}</div>
            </div>
            <div style={{ textAlign: 'center', padding: '0.75rem', background: '#f3f4f6', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Avg Order</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f59e0b' }}>KSh {liveStats.averageOrderValue}</div>
            </div>
          </div>
          
          {/* Most Bought Drinks Today */}
          {topProducts && topProducts.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={14} /> Most Bought Drinks Today
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {topProducts.map((product, idx) => (
                  <div key={product.name} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem',
                    background: idx === 0 ? '#fef3c7' : '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '14px',
                      background: idx === 0 ? '#f59e0b' : '#3b82f6',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.8rem'
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{product.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>{product.category}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{product.quantity} units</div>
                      <div style={{ fontSize: '0.7rem', color: '#10b981' }}>KSh {product.revenue.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #e5e7eb', fontSize: '0.7rem', color: '#6b7280', textAlign: 'center' }}>
            Next order #: {liveStats.currentCounter}
          </div>
        </div>
      )}
    </div>
  );
};
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: 'calc(100vh - 60px)', 
      padding: '1rem', 
      gap: '1rem',
      background: '#f3f4f6'
    }}>
      {/* Mobile: Cart Toggle Button */}
      {!isDesktop && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <button
            onClick={() => setShowCart(false)}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: !showCart ? '#3b82f6' : '#e5e7eb',
              border: 'none',
              borderRadius: '10px',
              color: !showCart ? 'white' : '#4b5563',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <Package size={18} />
            Products ({filteredProducts.length})
          </button>
          <button
            onClick={() => setShowCart(true)}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: showCart ? '#3b82f6' : '#e5e7eb',
              border: 'none',
              borderRadius: '10px',
              color: showCart ? 'white' : '#4b5563',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              position: 'relative'
            }}
          >
            <ShoppingCart size={18} />
            Cart ({getCartCount()})
          </button>
        </div>
      )}
      
      {/* Products Panel */}
      <div style={{ 
        flex: 2, 
        overflow: 'auto', 
        background: 'white', 
        borderRadius: '16px', 
        padding: '1rem',
        display: (!isDesktop && showCart) ? 'none' : 'block',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>Products</h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '10px', 
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <Filter size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '10px', 
                  fontSize: '14px',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '1rem'
        }}>
          {filteredProducts.map(product => (
            <div key={product.id} style={{
              background: '#f9fafb',
              padding: '1rem',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: '1px solid #e5e7eb'
            }}
            onClick={() => addToCart(product, 1)}>
              <div style={{ width: '100%', height: '100px', background: '#e5e7eb', borderRadius: '8px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={32} color="#9ca3af" />
              </div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>{product.name}</h4>
              <p style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '0.5rem' }}>{product.category}</p>
              <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#10b981' }}>KSh {product.price.toLocaleString()}</p>
              <p style={{ fontSize: '0.7rem', color: product.stock < 10 ? '#f59e0b' : '#10b981' }}>
                Stock: {product.stock}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Cart Panel */}
      <div style={{ 
        flex: 1, 
        background: 'white', 
        borderRadius: '16px', 
        padding: '1rem', 
        display: 'flex', 
        flexDirection: 'column', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: (!isDesktop && !showCart) ? 'none' : 'flex'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingCart size={20} />
          Current Order
        </h2>
        <div style={{ background: '#f3f4f6', padding: '0.5rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>
          Counter: <strong>#{dailyCounter + 1}</strong>
        </div>
        
        <div style={{ flex: 1, overflow: 'auto', maxHeight: '350px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
              <Package size={48} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
              <p>Tap products to add</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                borderBottom: '1px solid #e5e7eb',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}>
                <div style={{ flex: 1, minWidth: '100px' }}>
                  <strong style={{ fontSize: '0.9rem' }}>{item.name}</strong>
                  <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>KSh {item.price.toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '8px', 
                      border: '1px solid #e5e7eb', 
                      cursor: 'pointer', 
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Minus size={16} />
                  </button>
                  <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: 500 }}>{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '8px', 
                      border: '1px solid #e5e7eb', 
                      cursor: 'pointer', 
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Plus size={16} />
                  </button>
                  <button 
                    onClick={() => removeFromCart(item.id)} 
                    style={{ 
                      background: '#fee2e2', 
                      color: '#ef4444', 
                      border: 'none', 
                      padding: '0.5rem', 
                      borderRadius: '8px', 
                      cursor: 'pointer', 
                      width: '32px', 
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {cart.length > 0 && (
          <>
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <strong>Total Items:</strong>
                <span>{getCartCount()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}>
                <span>Total:</span>
                <span style={{ color: '#10b981' }}>KSh {getCartTotal().toLocaleString()}</span>
              </div>
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Customer Details</h4>
              <input
                type="text"
                placeholder="Customer Name (optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '16px' }}
              />
              <input
                type="tel"
                placeholder="Phone Number (optional)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '16px' }}
              />
            </div>
            
            <div style={{ marginTop: '0.75rem' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Payment Method</h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => setPaymentMethod('cash')} 
                  style={{ 
                    flex: 1, 
                    padding: '0.75rem', 
                    background: paymentMethod === 'cash' ? '#3b82f6' : '#f3f4f6', 
                    border: 'none', 
                    borderRadius: '10px', 
                    cursor: 'pointer', 
                    color: paymentMethod === 'cash' ? 'white' : '#4b5563', 
                    fontWeight: 500, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.5rem'
                  }}
                >
                  <Wallet size={16} /> Cash
                </button>
                <button 
                  onClick={() => setPaymentMethod('mpesa')} 
                  style={{ 
                    flex: 1, 
                    padding: '0.75rem', 
                    background: paymentMethod === 'mpesa' ? '#3b82f6' : '#f3f4f6', 
                    border: 'none', 
                    borderRadius: '10px', 
                    cursor: 'pointer', 
                    color: paymentMethod === 'mpesa' ? 'white' : '#4b5563', 
                    fontWeight: 500, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.5rem'
                  }}
                >
                  <Smartphone size={16} /> M-Pesa
                </button>
                <button 
                  onClick={() => setPaymentMethod('card')} 
                  style={{ 
                    flex: 1, 
                    padding: '0.75rem', 
                    background: paymentMethod === 'card' ? '#3b82f6' : '#f3f4f6', 
                    border: 'none', 
                    borderRadius: '10px', 
                    cursor: 'pointer', 
                    color: paymentMethod === 'card' ? 'white' : '#4b5563', 
                    fontWeight: 500, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.5rem'
                  }}
                >
                  <CreditCard size={16} /> Card
                </button>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexDirection: 'column' }}>
              <button 
                onClick={clearCart} 
                style={{ 
                  background: '#fee2e2', 
                  color: '#ef4444', 
                  border: 'none', 
                  padding: '0.75rem', 
                  borderRadius: '10px', 
                  cursor: 'pointer', 
                  fontWeight: 600
                }}
              >
                Clear Cart
              </button>
              <button 
                onClick={handleProcessOrder} 
                style={{ 
                  background: '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.75rem', 
                  borderRadius: '10px', 
                  cursor: 'pointer', 
                  fontSize: '1rem', 
                  fontWeight: 600
                }}
              >
                Complete Order ✓
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* Receipt Toast */}
      {showReceipt && lastOrder && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          left: window.innerWidth <= 768 ? '20px' : 'auto',
          background: 'white',
          padding: '1rem',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          borderLeft: '4px solid #10b981',
          zIndex: 1000,
          maxWidth: '350px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h4 style={{ color: '#10b981' }}>Order Complete!</h4>
            <button onClick={() => setShowReceipt(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
          <p><strong>Order #{lastOrder.orderNumber}</strong></p>
          <p>Total: KSh {lastOrder.total.toLocaleString()}</p>
          <p>Payment: {lastOrder.paymentMethod.toUpperCase()}</p>
          <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>{lastOrder.time}</p>
        </div>
      )}
    </div>
  );
};

export default POS;