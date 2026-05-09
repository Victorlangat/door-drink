import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

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
      setTimeout(() => setShowReceipt(false), 5000);
    }
  };
  
  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', padding: '1rem', gap: '1rem' }}>
      {/* Products Panel */}
      <div style={{ flex: 2, overflow: 'auto', background: '#f5f5f5', borderRadius: '10px', padding: '1rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h2>Product Catalog</h2>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '5px' }}
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '5px' }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {filteredProducts.map(product => (
            <div key={product.id} style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '10px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onClick={() => addToCart(product, 1)}>
              {product.image && (
                <img src={product.image} alt={product.name} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '5px', marginBottom: '0.5rem' }} />
              )}
              <h4>{product.name}</h4>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>{product.category}</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2e7d32' }}>KSh {product.price}</p>
              <p style={{ fontSize: '0.8rem', color: product.stock < 10 ? '#ff9800' : '#4CAF50' }}>
                Stock: {product.stock}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Cart Panel */}
      <div style={{ flex: 1, background: 'white', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h2>Current Order</h2>
        <div style={{ background: '#f0f0f0', padding: '0.5rem', borderRadius: '5px', marginBottom: '1rem', textAlign: 'center' }}>
          Counter: <strong>#{dailyCounter + 1}</strong>
        </div>
        
        <div style={{ flex: 1, overflow: 'auto', maxHeight: '400px' }}>
          {cart.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>Click products to add to order</p>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                borderBottom: '1px solid #eee'
              }}>
                <div style={{ flex: 2 }}>
                  <strong>{item.name}</strong>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>KSh {item.price}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: '28px', height: '28px', borderRadius: '5px', border: '1px solid #ddd', cursor: 'pointer' }}>-</button>
                  <span style={{ minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: '28px', height: '28px', borderRadius: '5px', border: '1px solid #ddd', cursor: 'pointer' }}>+</button>
                  <button onClick={() => removeFromCart(item.id)} style={{ background: '#f44336', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '5px', cursor: 'pointer' }}>×</button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {cart.length > 0 && (
          <>
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #ddd' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong>Total Items:</strong>
                <span>{getCartCount()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}>
                <span>Total:</span>
                <span style={{ color: '#2e7d32' }}>KSh {getCartTotal()}</span>
              </div>
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <h4>Customer Details (Optional)</h4>
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', border: '1px solid #ddd', borderRadius: '5px' }}
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', border: '1px solid #ddd', borderRadius: '5px' }}
              />
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <h4>Payment Method</h4>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setPaymentMethod('cash')} style={{ flex: 1, padding: '0.5rem', background: paymentMethod === 'cash' ? '#4CAF50' : '#f0f0f0', border: 'none', borderRadius: '5px', cursor: 'pointer', color: paymentMethod === 'cash' ? 'white' : '#333' }}>💵 Cash</button>
                <button onClick={() => setPaymentMethod('mpesa')} style={{ flex: 1, padding: '0.5rem', background: paymentMethod === 'mpesa' ? '#4CAF50' : '#f0f0f0', border: 'none', borderRadius: '5px', cursor: 'pointer', color: paymentMethod === 'mpesa' ? 'white' : '#333' }}>📱 M-Pesa</button>
                <button onClick={() => setPaymentMethod('card')} style={{ flex: 1, padding: '0.5rem', background: paymentMethod === 'card' ? '#4CAF50' : '#f0f0f0', border: 'none', borderRadius: '5px', cursor: 'pointer', color: paymentMethod === 'card' ? 'white' : '#333' }}>💳 Card</button>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button onClick={clearCart} style={{ flex: 1, background: '#f44336', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '5px', cursor: 'pointer' }}>Clear Cart</button>
              <button onClick={handleProcessOrder} style={{ flex: 2, background: '#4CAF50', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>Complete Order ✓</button>
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
          background: 'white',
          padding: '1rem',
          borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          minWidth: '300px',
          borderLeft: '4px solid #4CAF50'
        }}>
          <h4>✅ Order Complete!</h4>
          <p><strong>Order #{lastOrder.orderNumber}</strong></p>
          <p>Total: KSh {lastOrder.total}</p>
          <p>Payment: {lastOrder.paymentMethod.toUpperCase()}</p>
          <p style={{ fontSize: '0.8rem', color: '#666' }}>{lastOrder.time}</p>
        </div>
      )}
    </div>
  );
};

export default POS;