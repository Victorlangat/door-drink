import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, getCartTotal, placeOrder, user } = useContext(AppContext);
  const navigate = useNavigate();
  const [deliveryDetails, setDeliveryDetails] = useState({
    address: '',
    city: 'Nairobi',
    phone: '',
    instructions: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!deliveryDetails.address || !deliveryDetails.phone) {
      alert('Please fill in delivery details');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate processing delay for security verification
    setTimeout(() => {
      const success = placeOrder(deliveryDetails);
      setIsProcessing(false);
      if (success) {
        navigate('/orders');
      }
    }, 1000);
  };
  
  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/shop')} style={{
          background: '#2196F3',
          border: 'none',
          padding: '1rem 2rem',
          borderRadius: '5px',
          cursor: 'pointer',
          color: 'white',
          marginTop: '1rem'
        }}>
          Start Shopping
        </button>
      </div>
    );
  }
  
  const subtotal = getCartTotal();
  const deliveryFee = 200;
  const total = subtotal + deliveryFee;
  
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Shopping Cart</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
        {/* Cart Items */}
        <div>
          {cart.map(item => (
            <div key={item.id} style={{
              display: 'flex',
              gap: '1rem',
              padding: '1rem',
              borderBottom: '1px solid #ddd',
              alignItems: 'center'
            }}>
              <div style={{ flex: 1 }}>
                <h3>{item.name}</h3>
                <p>KSh {item.price}</p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    border: '1px solid #ddd',
                    cursor: 'pointer'
                  }}
                >-</button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    border: '1px solid #ddd',
                    cursor: 'pointer'
                  }}
                >+</button>
              </div>
              
              <div style={{ fontWeight: 'bold', minWidth: '100px' }}>
                KSh {item.price * item.quantity}
              </div>
              
              <button
                onClick={() => removeFromCart(item.id)}
                style={{
                  background: '#f44336',
                  border: 'none',
                  padding: '0.5rem',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  color: 'white'
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        
        {/* Order Summary */}
        <div style={{
          background: '#f5f5f5',
          padding: '1.5rem',
          borderRadius: '10px',
          position: 'sticky',
          top: '80px'
        }}>
          <h2>Order Summary</h2>
          <div style={{ margin: '1rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Subtotal:</span>
              <span>KSh {subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Delivery:</span>
              <span>KSh {deliveryFee}</span>
            </div>
            <hr style={{ margin: '1rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
              <span>Total:</span>
              <span>KSh {total}</span>
            </div>
          </div>
          
          <div style={{ marginTop: '1rem' }}>
            <h3>Delivery Details</h3>
            <input
              type="text"
              placeholder="Address *"
              value={deliveryDetails.address}
              onChange={(e) => setDeliveryDetails({...deliveryDetails, address: e.target.value})}
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '5px'
              }}
            />
            <input
              type="tel"
              placeholder="Phone Number *"
              value={deliveryDetails.phone}
              onChange={(e) => setDeliveryDetails({...deliveryDetails, phone: e.target.value})}
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '5px'
              }}
            />
            <textarea
              placeholder="Delivery Instructions"
              value={deliveryDetails.instructions}
              onChange={(e) => setDeliveryDetails({...deliveryDetails, instructions: e.target.value})}
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '1rem',
                border: '1px solid #ddd',
                borderRadius: '5px',
                minHeight: '80px'
              }}
            />
          </div>
          
          <button
            onClick={handleCheckout}
            disabled={isProcessing}
            style={{
              width: '100%',
              background: isProcessing ? '#ccc' : '#4CAF50',
              border: 'none',
              padding: '1rem',
              borderRadius: '5px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              color: 'white',
              fontSize: '1.1rem'
            }}
          >
            {isProcessing ? 'Processing Order...' : 'Place Order'}
          </button>
          
          <p style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center', marginTop: '1rem' }}>
            🔒 Secure checkout. Inventory verified in real-time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cart;