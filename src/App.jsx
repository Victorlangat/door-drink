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

const AdminRoute = ({ children }) => {
  const { admin } = React.useContext(AppContext);
  if (!admin) return <Navigate to="/admin/login" />;
  return children;
};

const StoreRoute = ({ children }) => {
  const { store } = React.useContext(AppContext);
  if (!store) return <Navigate to="/login" />;
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
              <Route path="/login" element={<StoreLogin />} />
              <Route path="/signup" element={<StoreSignup />} />
              <Route path="/pos" element={<StoreRoute><POS /></StoreRoute>} />
              <Route path="/admin/check" element={<StoreRoute><AdminRedirect /></StoreRoute>} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/register" element={<StoreRoute><AdminRegister /></StoreRoute>} />
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
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