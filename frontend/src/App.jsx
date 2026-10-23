import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import CrudPage from './components/tables/CrudPage';
import LoginPage from './pages/LoginPage';
import FinesPaymentsPage from './pages/FinesPaymentsPage';
import { schemas } from './utils/schema';

function App() {
  const [session, setSession] = useState(localStorage.getItem('auth') === 'true');

  const handleLogout = () => {
    localStorage.removeItem('auth');
    setSession(false);
  };

  const ProtectedLayout = () => (
    <Layout onLogout={handleLogout} />
  );

  if (!session) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<LoginPage onLogin={() => setSession(true)} />} />
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
          <Route path="fines" element={<FinesPaymentsPage />} />
          <Route path="payments" element={<FinesPaymentsPage />} />
          {Object.entries(schemas)
            .filter(([key]) => key !== 'fines' && key !== 'payments')
            .map(([key, schema]) => (
              <Route key={key} path={key} element={<CrudPage schema={schema} />} />
            ))}
          <Route path="*" element={<div className="p-8 text-center text-xl font-medium text-gray-500">404 - Page Not Found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
