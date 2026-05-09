import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, AppContext } from './context/AppContext';
import Navbar from './components/Navbar';
import POS from './pages/POS';
import Admin from './pages/Admin';
import Login from './pages/Login';

// Protected Route component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user } = React.useContext(AppContext);
  
  if (!user) return <Navigate to="/login" />;
  if (requireAdmin && !user.isAdmin) return <Navigate to="/pos" />;
  
  return children;
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <main style={{ minHeight: '100vh', paddingTop: '60px' }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/pos" element={
                <ProtectedRoute>
                  <POS />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                  <Admin />
                </ProtectedRoute>
              } />
              <Route path="/" element={<Navigate to="/pos" />} />
            </Routes>
          </main>
          <Toaster position="bottom-right" />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;