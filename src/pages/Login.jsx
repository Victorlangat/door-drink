import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ShoppingBag, Mail, Lock, LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(AppContext);
  const navigate = useNavigate();
  
  const handleLogin = () => {
    if (email && password) {
      const user = {
        email,
        isAdmin: email === 'admin@sipsync.com'
      };
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/pos');
    }
  };
  
  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        padding: '2rem',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: '#3b82f6', width: '60px', height: '60px', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <ShoppingBag size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.5rem' }}>Nexus POS</h1>
            <p style={{ color: '#6b7280' }}>Store Login</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '16px' }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '16px' }}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <button
            onClick={handleLogin}
            style={{
              background: '#3b82f6',
              border: 'none',
              padding: '0.75rem',
              borderRadius: '10px',
              cursor: 'pointer',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <LogIn size={18} />
            Login
          </button>
          <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid #e5e7eb', marginTop: '0.5rem' }}>
            <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>
              Demo: Any email/password<br/>
              <strong>Admin:</strong> admin@sipsync.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;