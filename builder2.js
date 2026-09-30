const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'frontend', 'src');

// src/pages/Dashboard.jsx
fs.writeFileSync(path.join(srcDir, 'pages', 'Dashboard.jsx'), `
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Book, Users, Calendar, DollarSign, AlertCircle, Building, Bookmark } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentLoans, setRecentLoans] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stRes, loansRes, booksRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/recent-loans'),
          api.get('/dashboard/recent-books')
        ]);
        setStats(stRes.data.data);
        setRecentLoans(loansRes.data.data);
        setRecentBooks(booksRes.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-secondaryText">Loading dashboard data...</div>;

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-border flex items-center gap-4">
      <div className={\`p-4 rounded-lg text-white \${color}\`}><Icon className="w-6 h-6" /></div>
      <div>
        <p className="text-sm font-medium text-secondaryText">{title}</p>
        <p className="text-2xl font-bold text-mainText">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-mainText">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Total Books" value={stats?.totalBooks} icon={Book} color="bg-primary" />
        <StatCard title="Active Loans" value={stats?.activeLoans} icon={Calendar} color="bg-teal" />
        <StatCard title="Overdue Loans" value={stats?.overdueLoans} icon={AlertCircle} color="bg-danger" />
        <StatCard title="Total Members" value={stats?.totalMembers} icon={Users} color="bg-purple" />
        <StatCard title="Available Copies" value={stats?.availableCopies} icon={Bookmark} color="bg-green" />
        <StatCard title="Issued Copies" value={stats?.issuedCopies} icon={Book} color="bg-warning" />
        <StatCard title="Outstanding Fines" value={stats?.outstandingFines} icon={DollarSign} color="bg-pink" />
        <StatCard title="Total Publishers" value={stats?.totalPublishers} icon={Building} color="bg-cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Loans</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-secondaryText uppercase bg-gray-50 border-b">
                <tr><th>Loan ID</th><th>Issue Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recentLoans.map(l => (
                  <tr key={l.LOANID} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-medium">{l.LOANID}</td>
                    <td className="py-3">{new Date(l.LOANDATE).toLocaleDateString()}</td>
                    <td className="py-3">
                      <span className={\`px-2 py-1 rounded-full text-xs \${l.STATUS === 'Active' ? 'bg-blue-100 text-blue-800' : l.STATUS === 'Overdue' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}\`}>
                        {l.STATUS}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentLoans.length === 0 && <tr><td colSpan="3" className="py-4 text-center text-gray-500">No recent loans</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Recently Added Books</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-secondaryText uppercase bg-gray-50 border-b">
                <tr><th>ID</th><th>Title</th><th>ISBN</th></tr>
              </thead>
              <tbody>
                {recentBooks.map(b => (
                  <tr key={b.BOOKID} className="border-b hover:bg-gray-50">
                    <td className="py-3">{b.BOOKID}</td>
                    <td className="py-3 font-medium">{b.TITLE}</td>
                    <td className="py-3">{b.ISBN}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
`);

// src/components/tables/CrudPage.jsx
fs.writeFileSync(path.join(srcDir, 'components', 'tables', 'CrudPage.jsx'), `
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';

export default function CrudPage({ schema }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [schema.endpoint]);

  const fetchData = async (searchQuery = '') => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(\`/\${schema.endpoint}?search=\${searchQuery}\`);
      setData(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(search);
  };

  const getPkValue = (item) => {
    if (Array.isArray(schema.pk)) {
      return schema.pk.map(k => \`\${k}=\${item[k]}\`).join('&');
    }
    return item[schema.pk];
  };

  const getDetailPath = (item) => {
    if (Array.isArray(schema.pk)) {
      return \`/\${schema.endpoint}/detail?\${getPkValue(item)}\`;
    }
    return \`/\${schema.endpoint}/\${getPkValue(item)}\`;
  };

  const handleDelete = async (item) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.delete(getDetailPath(item));
      fetchData(search);
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const openModal = (item = null) => {
    setEditingItem(item);
    setFormData(item || {});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await api.put(getDetailPath(editingItem), formData);
      } else {
        await api.post(\`/\${schema.endpoint}\`, formData);
      }
      setModalOpen(false);
      fetchData(search);
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-mainText">{schema.title}</h1>
          <p className="text-sm text-secondaryText">Manage {schema.title.toLowerCase()} in the system.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <form onSubmit={handleSearch} className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" placeholder="Search..." 
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
            />
          </form>
          <button onClick={() => openModal()} className="bg-primary hover:bg-activeBlue text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden flex-1">
        {error && <div className="p-4 bg-red-50 text-danger text-sm border-b">{error}</div>}
        
        <div className="overflow-x-auto h-full">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-secondaryText uppercase bg-gray-50 border-b sticky top-0">
              <tr>
                {schema.columns.map(c => <th key={c.key} className="px-6 py-3 font-medium">{c.label}</th>)}
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={schema.columns.length + 1} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={schema.columns.length + 1} className="px-6 py-12 text-center text-gray-500">No records found.</td></tr>
              ) : (
                data.map((item, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                    {schema.columns.map(c => (
                      <td key={c.key} className="px-6 py-3">{item[c.key]}</td>
                    ))}
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openModal(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(item)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b shrink-0">
              <h3 className="font-semibold text-lg">{editingItem ? 'Edit' : 'Add'} {schema.title}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 overflow-y-auto">
              <form id="crud-form" onSubmit={handleSubmit} className="space-y-4">
                {schema.form.map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{f.label} {f.required && '*'}</label>
                    <input 
                      type={f.type || 'text'}
                      required={f.required}
                      disabled={editingItem && ((Array.isArray(schema.pk) ? schema.pk.includes(f.key) : schema.pk === f.key))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:bg-gray-100"
                      value={formData[f.key] || ''}
                      onChange={e => setFormData({...formData, [f.key]: e.target.value})}
                    />
                  </div>
                ))}
              </form>
            </div>
            <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 shrink-0 rounded-b-xl">
              <button onClick={() => setModalOpen(false)} type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button form="crud-form" type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-activeBlue disabled:opacity-50">
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`);

// src/App.jsx
fs.writeFileSync(path.join(srcDir, 'App.jsx'), `
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import CrudPage from './components/tables/CrudPage';
import { schemas } from './utils/schema';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
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
`);

// src/main.jsx
fs.writeFileSync(path.join(srcDir, 'main.jsx'), `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`);
