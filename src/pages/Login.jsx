import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(AppContext);
  const navigate = useNavigate();
  
  const handleLogin = () => {
    if (email && password) {
      const user = {
        email,
        isAdmin: email === 'admin@doordrink.com'
      };
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/pos');
    }
  };
  
  return (
    <div style={{
      maxWidth: '400px',
      margin: '100px auto',
      padding: '2rem',
      background: 'white',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Door Drink Kenya POS</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '5px' }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '5px' }} />
        <button onClick={handleLogin} style={{ background: '#2196F3', border: 'none', padding: '0.75rem', borderRadius: '5px', cursor: 'pointer', color: 'white', fontSize: '1rem' }}>Login</button>
        <p style={{ textAlign: 'center', color: '#666', fontSize: '0.85rem' }}>Demo: Any email/password<br/>Admin: admin@doordrink.com</p>
      </div>
    </div>
  );
};

export default Login;