import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, AppContext } from './context/AppContext';
import Navbar from './components/Navbar';
import POS from './pages/POS';
import Admin from './pages/Admin';
import Login from './pages/Login';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user } = React.useContext(AppContext);
  
  if (!user) return <Navigate to="/login" />;
  if (requireAdmin && !user.isAdmin) return <Navigate to="/pos" />;
  
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
          <Toaster position="bottom-center" />
        </div>
      </HashRouter>
    </AppProvider>
  );
}

export default App;