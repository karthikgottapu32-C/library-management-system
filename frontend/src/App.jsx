
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import CrudPage from './components/tables/CrudPage';
import LoginPage from './pages/LoginPage';
import { schemas } from './utils/schema';
import { getSupabaseClient } from './services/supabase';

function App() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let supabase;
    try {
      supabase = getSupabaseClient();
    } catch {
      setAuthReady(true);
      return undefined;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) throw error;
      setSession(data.session);
      setAuthReady(true);
    }).catch(() => setAuthReady(true));

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await getSupabaseClient().auth.signOut();
  };

  const ProtectedLayout = () => (
    <Layout onLogout={handleLogout} />
  );

  if (!authReady) {
    return <div className="flex min-h-screen items-center justify-center text-white/60">Loading session...</div>;
  }

  if (!session) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<LoginPage />} />
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
