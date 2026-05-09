import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const Orders = () => {
  const { orders } = useContext(AppContext);
  
  if (orders.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>No orders yet</h2>
        <p>Start shopping to see your orders here!</p>
      </div>
    );
  }
  
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1>My Orders</h1>
      
      {orders.map(order => (
        <div key={order.id} style={{
          background: 'white',
          borderRadius: '10px',
          padding: '1.5rem',
          marginBottom: '1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #ddd'
          }}>
            <div>
              <strong>Order #{order.id}</strong>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                {new Date(order.date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span style={{
                background: order.status === 'delivered' ? '#4CAF50' : '#ff9800',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '5px',
                fontSize: '0.9rem'
              }}>
                {order.status}
              </span>
            </div>
          </div>
          
          {order.items.map(item => (
            <div key={item.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.5rem 0'
            }}>
              <span>{item.name} x {item.quantity}</span>
              <span>KSh {item.price * item.quantity}</span>
            </div>
          ))}
          
          <div style={{
            marginTop: '1rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid #ddd',
            textAlign: 'right',
            fontWeight: 'bold'
          }}>
            Total: KSh {order.total + 200}
          </div>
          
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: '#f5f5f5',
            borderRadius: '5px',
            fontSize: '0.9rem'
          }}>
            <strong>Delivery Address:</strong> {order.deliveryDetails.address}, {order.deliveryDetails.city}<br/>
            <strong>Phone:</strong> {order.deliveryDetails.phone}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders;