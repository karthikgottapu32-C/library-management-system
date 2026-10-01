import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Users, Calendar, DollarSign, AlertCircle, Building, Bookmark, BookCopy, TrendingUp, Library, RefreshCw, CheckCircle, BarChart3, ArrowLeft, PenTool, Tags } from 'lucide-react';
import ErrorBoundary from '../components/ErrorBoundary';
import CrudPage from '../components/tables/CrudPage';
import { schemas } from '../utils/schema';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } }
};

const tableVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

function StatCard({ title, value, icon: Icon, gradient, delay, onClick, active }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={onClick}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`relative overflow-hidden rounded-2xl p-5 group cursor-pointer transition-all duration-300 ${active ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-[#0f111a]' : 'hover:ring-1 hover:ring-white/20'}`}
      style={{ background: active ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div
        className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl transition-opacity duration-500 ${active ? 'opacity-60' : 'opacity-20 group-hover:opacity-40'}`}
        style={{ background: gradient }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40">{title}</p>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
            style={{ background: gradient, opacity: 0.85 }}
          >
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>
        <motion.p
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 + delay, type: 'spring', stiffness: 300 }}
          className="text-3xl font-extrabold text-white tracking-tight"
        >
          {value ?? '—'}
        </motion.p>
      </div>
    </motion.div>
  );
}

function ContextAnalytics({ data }) {
  if (!data || Object.keys(data).length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {Object.entries(data).map(([key, list], i) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="p-5 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h3 className="text-sm font-semibold text-white/70 mb-4 capitalize flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </h3>
          <div className="space-y-3">
            {list.length === 0 && <p className="text-sm text-white/30">No data available.</p>}
            {list.map((item, idx) => {
              const maxVal = Math.max(...list.map(l => Number(l.VALUE) || 0));
              const pct = maxVal > 0 ? (Number(item.VALUE) / maxVal) * 100 : 0;
              return (
                <div key={idx} className="relative">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/80 truncate pr-4">{item.LABEL || 'Unknown'}</span>
                    <span className="text-white font-medium">{item.VALUE}</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="bg-indigo-500 h-full rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function DashboardContent() {
  const [stats, setStats] = useState(null);
  const [recentLoans, setRecentLoans] = useState([]);
  
  const [activeCard, setActiveCard] = useState(null); // null means 'dashboard'
  const [contextData, setContextData] = useState(null);
  const [contextLoading, setContextLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchGlobalData = async () => {
    setLoading(true);
    setHasError(false);
    setErrorMessage('');
    try {
      const [s, l] = await Promise.all([
        api.get('/dashboard/summary').then(r => r.data?.data || {}),
        api.get('/dashboard/recent-loans').then(r => r.data?.data || [])
      ]);
      setStats(s);
      setRecentLoans(Array.isArray(l) ? l : []);
    } catch (e) {
      setHasError(true);
      const detail = e.response?.data?.message;
      setErrorMessage(detail ? `Dashboard request failed: ${detail}` : 'Could not reach the backend through /api.');
    } finally {
      setLoading(false);
    }
  };

  const loadContextData = async (cardId) => {
    if (!cardId) {
      setContextData(null);
      return;
    }
    setContextLoading(true);
    try {
      const r = await api.get(`/dashboard/context?module=${cardId}`);
      setContextData(r.data?.data || null);
    } catch (e) {
      console.error("Failed to load context stats:", e);
      setContextData(null);
    } finally {
      setContextLoading(false);
    }
  };

  useEffect(() => { fetchGlobalData(); }, []);

  const handleCardClick = (cardId) => {
    if (activeCard === cardId) {
      setActiveCard(null); // toggle off
      setContextData(null);
    } else {
      setActiveCard(cardId);
      loadContextData(cardId);
    }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center gap-3">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full" />
      <span className="text-white/40 text-sm">Loading dashboard...</span>
    </div>
  );

  if (hasError) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <AlertCircle className="w-10 h-10 text-red-400" />
      <p className="text-white/60 text-center max-w-2xl">{errorMessage || 'Failed to load dashboard data.'}</p>
      <button onClick={fetchGlobalData} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors">
        <RefreshCw className="w-4 h-4" /> Retry
      </button>
    </div>
  );

  const statCards = [
    { id: 'books', schemaKey: 'books', title: 'Total Books', value: stats?.totalBooks, icon: Library, gradient: 'linear-gradient(135deg,#3b82f6,#60a5fa)', delay: 0 },
    { id: 'members', schemaKey: 'members', title: 'Total Members', value: stats?.totalMembers, icon: Users, gradient: 'linear-gradient(135deg,#06b6d4,#22d3ee)', delay: 0.05 },
    { id: 'authors', schemaKey: 'authors', title: 'Authors', value: stats?.totalAuthors, icon: PenTool, gradient: 'linear-gradient(135deg,#8b5cf6,#a78bfa)', delay: 0.1 },
    { id: 'categories', schemaKey: 'categories', title: 'Categories', value: stats?.totalCategories, icon: Tags, gradient: 'linear-gradient(135deg,#10b981,#34d399)', delay: 0.15 },
    { id: 'available_copies', schemaKey: 'book-copies', title: 'Available Copies', value: stats?.availableCopies, icon: Bookmark, gradient: 'linear-gradient(135deg,#0ea5e9,#38bdf8)', delay: 0.2 },
    { id: 'issued_copies', schemaKey: 'book-copies', title: 'Issued Copies', value: stats?.issuedCopies, icon: BookCopy, gradient: 'linear-gradient(135deg,#f59e0b,#fbbf24)', delay: 0.25 },
    { id: 'active_loans', schemaKey: 'loans', title: 'Active Loans', value: stats?.activeLoans, icon: Calendar, gradient: 'linear-gradient(135deg,#14b8a6,#2dd4bf)', delay: 0.3 },
    { id: 'overdue_loans', schemaKey: 'loans', title: 'Overdue Loans', value: stats?.overdueLoans, icon: AlertCircle, gradient: 'linear-gradient(135deg,#ef4444,#f87171)', delay: 0.35 },
    { id: 'unpaid_fines', schemaKey: 'fines', title: 'Unpaid Fines', value: stats?.outstandingFines, icon: DollarSign, gradient: 'linear-gradient(135deg,#ec4899,#f472b6)', delay: 0.4 }
  ];

  const loanStatusColor = (status) => {
    if (status === 'Active') return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20';
    if (status === 'Overdue') return 'bg-red-500/15 text-red-400 border border-red-500/20';
    return 'bg-white/10 text-white/50 border border-white/10';
  };

  const activeSchemaKey = activeCard ? statCards.find(c => c.id === activeCard)?.schemaKey : null;
  const activeSchema = activeSchemaKey ? schemas[activeSchemaKey] : null;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-1 flex items-center gap-2">
            <Library className="w-7 h-7 text-indigo-400" />
            Library Dashboard
          </h1>
          <p className="text-white/40 text-sm">Real-time overview of your library system</p>
        </div>
        <button onClick={fetchGlobalData} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-sm transition-all interactive">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        {statCards.map((c) => (
          <StatCard key={c.id} {...c} active={activeCard === c.id} onClick={() => handleCardClick(c.id)} />
        ))}
      </motion.div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {!activeCard ? (
            <motion.div key="recent-loans" variants={tableVariants} initial="hidden" animate="visible" exit={{ opacity: 0, y: -20 }} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" /> Recent Loans
                </h2>
                <span className="text-xs text-white/30">{recentLoans.length} records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wider text-white/30">
                      <th className="px-6 py-3 text-left font-medium">Loan ID</th>
                      <th className="px-6 py-3 text-left font-medium">Issue Date</th>
                      <th className="px-6 py-3 text-left font-medium">Due Date</th>
                      <th className="px-6 py-3 text-right font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLoans.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-10 text-center text-white/30">No loans found</td></tr>
                    ) : recentLoans.map((l, i) => (
                      <motion.tr key={l.LOANID} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                        <td className="px-6 py-3 text-white/80 font-medium">#{l.LOANID}</td>
                        <td className="px-6 py-3 text-white/50">{l.ISSUEDATE ? new Date(l.ISSUEDATE).toLocaleDateString() : '—'}</td>
                        <td className="px-6 py-3 text-white/50">{l.DUEDATE ? new Date(l.DUEDATE).toLocaleDateString() : '—'}</td>
                        <td className="px-6 py-3 text-right">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${loanStatusColor(l.STATUS)}`}>{l.STATUS}</span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div key={activeCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="pt-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {statCards.find(c => c.id === activeCard)?.title} Analytics
                </h2>
                <button onClick={() => setActiveCard(null)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-medium transition-all">
                  <ArrowLeft className="w-4 h-4" /> Back to Overview
                </button>
              </div>

              {contextLoading ? (
                <div className="flex h-32 items-center justify-center gap-3">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full" />
                </div>
              ) : (
                <ContextAnalytics data={contextData} />
              )}
              
              {activeSchema && <CrudPage schema={activeSchema} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}
