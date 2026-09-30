
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import CrudPage from './components/tables/CrudPage';
import LoginPage from './pages/LoginPage';
import { schemas } from './utils/schema';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('library-admin-auth') === 'true';
  });

  const handleLogin = () => {
    localStorage.setItem('library-admin-auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('library-admin-auth');
    setIsAuthenticated(false);
  };

  const ProtectedLayout = () => (
    <Layout onLogout={handleLogout} />
  );

  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProtectedLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          {Object.entries(schemas).map(([key, schema]) => (
            <Route key={key} path={key} element={<CrudPage schema={schema} />} />
          ))}
          <Route path="*" element={<div className="p-8 text-center text-xl font-medium text-gray-500">404 - Page Not Found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
