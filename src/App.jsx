import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, AppContext } from './context/AppContext';
import Navbar from './components/Navbar';
import POS from './pages/POS';
import Admin from './pages/Admin';
import StoreLogin from './pages/StoreLogin';
import StoreSignup from './pages/StoreSignup';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AdminRedirect from './pages/AdminRedirect';
import './styles/global.css';

// Protected Route for Admin - ONLY admin can access
const AdminRoute = ({ children }) => {
  const { admin } = React.useContext(AppContext);
  const [isChecking, setIsChecking] = React.useState(true);
  const [hasAdmin, setHasAdmin] = React.useState(false);
  
  React.useEffect(() => {
    // Check localStorage directly as well for persistence
    const savedAdmin = localStorage.getItem('sipsync_admin');
    if (savedAdmin || admin) {
      setHasAdmin(true);
    }
    setIsChecking(false);
  }, [admin]);
  
  if (isChecking) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Checking session...</div>;
  }
  
  if (!hasAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

// Protected Route for Store - anyone with store login can access POS
const StoreRoute = ({ children }) => {
  const { store } = React.useContext(AppContext);
  const [isChecking, setIsChecking] = React.useState(true);
  const [hasStore, setHasStore] = React.useState(false);
  
  React.useEffect(() => {
    const savedStore = localStorage.getItem('sipsync_store');
    if (savedStore || store) {
      setHasStore(true);
    }
    setIsChecking(false);
  }, [store]);
  
  if (isChecking) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Checking session...</div>;
  }
  
  if (!hasStore) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <div className="app">
          <Navbar />
          <main style={{ minHeight: 'calc(100vh - 60px)', paddingTop: '60px' }}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<StoreLogin />} />
              <Route path="/signup" element={<StoreSignup />} />
              
              {/* POS route - accessible by anyone with store login (cashier or admin) */}
              <Route path="/pos" element={<StoreRoute><POS /></StoreRoute>} />
              
              {/* Admin routes - only accessible by admin users */}
              <Route path="/admin/check" element={<StoreRoute><AdminRedirect /></StoreRoute>} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/register" element={<StoreRoute><AdminRegister /></StoreRoute>} />
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </main>
          <Toaster position="bottom-center" />
        </div>
      </HashRouter>
    </AppProvider>
  );
}

export default App;