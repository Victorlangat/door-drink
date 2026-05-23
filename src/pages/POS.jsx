import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  Search, Filter, Plus, Minus, Trash2, CreditCard, 
  Smartphone, Wallet, X, ShoppingCart, Package, 
  TrendingUp, Zap, Coffee, Box, Sparkles
} from 'lucide-react';
import '../styles/POS.css';

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
  const [isProcessing, setIsProcessing] = useState(false);
  
  const categories = React.useMemo(() => {
    return ['all', ...new Set(products.map(p => p.category))];
  }, [products]);
  
  const filteredProducts = React.useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory && product.stock > 0;
    });
  }, [products, searchTerm, selectedCategory]);
  
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 769);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleProcessOrder = useCallback(async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }
    
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const result = await processOrder(paymentMethod, customerName, customerPhone);
      
      if (result && result.success) {
        setLastOrder({
          orderNumber: result.orderNumber,
          items: [...cart],
          total: result.total,
          paymentMethod,
          customerName: customerName || 'Walk-in Customer',
          time: new Date()
        });
        setShowReceipt(true);
        setCustomerName('');
        setCustomerPhone('');
        if (!isDesktop) setShowCart(false);
        
        setTimeout(() => setShowReceipt(false), 3000);
      }
    } catch (error) {
      console.error('Order error:', error);
      alert('Failed to process order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [cart, paymentMethod, customerName, customerPhone, processOrder, isDesktop, isProcessing]);
  
  const formatReceiptTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };
  
  const getProductImage = useCallback((product) => {
    if (product.image_url && product.image_url.trim() !== '') {
      return product.image_url;
    }
    return 'https://images.unsplash.com/photo-1584770011470-9d1560e2e0d4?w=200&h=200&fit=crop';
  }, []);
  
  return (
    <div className="pos-container">
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem' }}>
        
        {/* Hero Banner */}
        <div className="hero-banner animate-fadeIn">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={28} />
                Nexus POS
              </h1>
              <p>Fast, efficient, and reliable point of sale system</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="badge badge-primary"><Zap size={12} /> Live</div>
              <div className="badge badge-success"><Box size={12} /> {dailyCounter + 1} orders today</div>
            </div>
          </div>
        </div>
        
        {/* Mobile Toggle */}
        {!isDesktop && (
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <button onClick={() => setShowCart(false)} className={`btn-${!showCart ? 'primary' : 'secondary'}`} style={{ flex: 1 }}><Package size={18} /> Products ({filteredProducts.length})</button>
            <button onClick={() => setShowCart(true)} className={`btn-${showCart ? 'primary' : 'secondary'}`} style={{ flex: 1, position: 'relative' }}><ShoppingCart size={18} /> Cart ({getCartCount()})</button>
          </div>
        )}
        
        {/* Main Content */}
        <div style={{ display: 'flex', gap: '1.5rem', flexDirection: isDesktop ? 'row' : 'column' }}>
          
          {/* Products Panel */}
          <div style={{ flex: 2, display: (!isDesktop && showCart) ? 'none' : 'block', animation: 'fadeIn 0.3s ease-out' }}>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                  <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" style={{ paddingLeft: '2.5rem' }} />
                </div>
                <div style={{ position: 'relative', width: '100%' }}>
                  <Filter size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="filter-select" style={{ paddingLeft: '2.5rem' }}>
                    {categories.map(cat => (<option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>))}
                  </select>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card" onClick={() => addToCart(product, 1)}>
                  <div className="product-image" style={{ backgroundImage: `url(${getProductImage(product)})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'var(--nexus-light-surface)' }}>
                    <div className="product-image-overlay"><span className="product-category">{product.category || 'General'}</span></div>
                  </div>
                  <div style={{ padding: '0.75rem' }}>
                    <h4 className="product-name">{product.name}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <span className="product-price">KES {product.price.toLocaleString()}</span>
                      <span className={`product-stock ${product.stock < 10 ? 'low' : ''}`}>{product.stock < 10 ? `Low: ${product.stock}` : `${product.stock} in stock`}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Cart Panel */}
          <div style={{ flex: 1.2, display: (!isDesktop && !showCart) ? 'none' : 'block', animation: 'slideInRight 0.3s ease-out' }}>
            <div className="cart-panel">
              <div className="cart-header"><ShoppingCart size={20} color="var(--nexus-primary)" /><h2>Current Order</h2><div className="counter-badge">#{dailyCounter + 1}</div></div>
              
              <div style={{ flex: 1, overflow: 'auto', maxHeight: '350px' }}>
                {cart.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}><Package size={40} style={{ marginBottom: '0.5rem', opacity: 0.5 }} /><p style={{ fontSize: '0.85rem' }}>Tap products to add</p></div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-info"><div className="cart-item-name">{item.name}</div><div className="cart-item-price">KES {item.price.toLocaleString()}</div></div>
                      <div className="cart-item-controls">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="qty-btn"><Minus size={14} /></button>
                        <span className="qty-value">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="qty-btn"><Plus size={14} /></button>
                        <button onClick={() => removeFromCart(item.id)} className="remove-btn"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {cart.length > 0 && (
                <>
                  <div className="cart-summary">
                    <div className="summary-row"><span>Total Items:</span><strong>{getCartCount()}</strong></div>
                    <div className="summary-total"><span>Total:</span><span>KES {getCartTotal().toLocaleString()}</span></div>
                  </div>
                  
                  <div style={{ marginTop: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Customer (Optional)</h4>
                    <input type="text" placeholder="Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="input-modern" style={{ marginBottom: '0.3rem', fontSize: '0.85rem', padding: '0.5rem' }} />
                    <input type="tel" placeholder="Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="input-modern" style={{ fontSize: '0.85rem', padding: '0.5rem' }} />
                  </div>
                  
                  <div style={{ marginTop: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Payment Method</h4>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      <button onClick={() => setPaymentMethod('cash')} className={`payment-btn ${paymentMethod === 'cash' ? 'active' : ''}`} style={{ padding: '0.5rem', fontSize: '0.8rem' }}><Wallet size={14} /> Cash</button>
                      <button onClick={() => setPaymentMethod('mpesa')} className={`payment-btn ${paymentMethod === 'mpesa' ? 'active' : ''}`} style={{ padding: '0.5rem', fontSize: '0.8rem' }}><Smartphone size={14} /> M-Pesa</button>
                      <button onClick={() => setPaymentMethod('card')} className={`payment-btn ${paymentMethod === 'card' ? 'active' : ''}`} style={{ padding: '0.5rem', fontSize: '0.8rem' }}><CreditCard size={14} /> Card</button>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexDirection: 'column' }}>
                    <button onClick={clearCart} disabled={isProcessing} className="btn-secondary" style={{ borderColor: 'var(--nexus-error)', color: 'var(--nexus-error)', padding: '0.6rem', fontSize: '0.85rem' }}>Clear Cart</button>
                    <button onClick={handleProcessOrder} disabled={isProcessing} className="complete-order-btn">
                      {isProcessing ? <><div className="spinner" style={{ width: '16px', height: '16px' }} /> Processing...</> : <>Complete Order</>}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Receipt Toast */}
      {showReceipt && lastOrder && (
        <div className="receipt-toast" style={{ animation: 'slideInRight 0.2s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <h4 style={{ color: 'var(--nexus-success)', fontSize: '0.9rem' }}>Order Complete</h4>
            <button onClick={() => setShowReceipt(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><X size={14} /></button>
          </div>
          <p style={{ fontSize: '0.85rem' }}><strong>#{lastOrder.orderNumber}</strong> • KES {lastOrder.total.toLocaleString()}</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{formatReceiptTime()}</p>
        </div>
      )}
    </div>
  );
};

export default POS;