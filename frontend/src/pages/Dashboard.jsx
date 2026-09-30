import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  Book, Users, Calendar, DollarSign, AlertCircle,
  Building, Bookmark, BookCopy, TrendingUp, Library,
  RefreshCw, CheckCircle
} from 'lucide-react';
import ErrorBoundary from '../components/ErrorBoundary';

// Stagger container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 22 }
  }
};

const tableVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

function StatCard({ title, value, icon: Icon, gradient, delay }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="relative overflow-hidden rounded-2xl p-5 group interactive cursor-pointer"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Gradient blob */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"
        style={{ background: gradient }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40">{title}</p>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
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

function DashboardContent() {
  const [stats, setStats] = useState(null);
  const [recentLoans, setRecentLoans] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setHasError(false);
    setErrorMessage('');
    try {
      const [s, l, b] = await Promise.all([
        api.get('/dashboard/summary').then(r => r.data?.data || {}),
        api.get('/dashboard/recent-loans').then(r => r.data?.data || []),
        api.get('/dashboard/recent-books').then(r => r.data?.data || [])
      ]);
      setStats(s);
      setRecentLoans(Array.isArray(l) ? l : []);
      setRecentBooks(Array.isArray(b) ? b : []);
    } catch (e) {
      setHasError(true);
      const response = e.response;
      const detail = response?.data?.message;
      setErrorMessage(detail
        ? `Dashboard request failed: ${detail}`
        : response
          ? `Dashboard API returned HTTP ${response.status}. Check the backend and database connection.`
          : 'Could not reach the backend through /api. Start the backend and confirm its database connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="flex h-64 items-center justify-center gap-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full"
      />
      <span className="text-white/40 text-sm">Loading dashboard...</span>
    </div>
  );

  if (hasError) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <AlertCircle className="w-10 h-10 text-red-400" />
      <p className="text-white/60 text-center max-w-2xl">{errorMessage || 'Failed to load dashboard data.'}</p>
      <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors">
        <RefreshCw className="w-4 h-4" /> Retry
      </button>
    </div>
  );

  const statCards = [
    { title: 'Total Books', value: stats?.totalBooks, icon: Library, gradient: 'linear-gradient(135deg,#3b82f6,#60a5fa)', delay: 0 },
    { title: 'Total Members', value: stats?.totalMembers, icon: Users, gradient: 'linear-gradient(135deg,#06b6d4,#22d3ee)', delay: 0.05 },
    { title: 'Available Copies', value: stats?.availableCopies, icon: Bookmark, gradient: 'linear-gradient(135deg,#8b5cf6,#a78bfa)', delay: 0.1 },
    { title: 'Issued Copies', value: stats?.issuedCopies, icon: BookCopy, gradient: 'linear-gradient(135deg,#f59e0b,#fbbf24)', delay: 0.15 },
    { title: 'Active Loans', value: stats?.activeLoans, icon: Calendar, gradient: 'linear-gradient(135deg,#10b981,#34d399)', delay: 0.2 },
    { title: 'Overdue Loans', value: stats?.overdueLoans, icon: AlertCircle, gradient: 'linear-gradient(135deg,#ef4444,#f87171)', delay: 0.25 },
    { title: 'Unpaid Fines', value: stats?.outstandingFines, icon: DollarSign, gradient: 'linear-gradient(135deg,#ec4899,#f472b6)', delay: 0.3 }
  ];

  const loanStatusColor = (status) => {
    if (status === 'Active') return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20';
    if (status === 'Overdue') return 'bg-red-500/15 text-red-400 border border-red-500/20';
    return 'bg-white/10 text-white/50 border border-white/10';
  };

  return (
    <div>
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-1 flex items-center gap-2">
            <Library className="w-7 h-7 text-indigo-400" />
            Library Dashboard
          </h1>
          <p className="text-white/40 text-sm">Real-time overview of your library system</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-sm transition-all interactive"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {statCards.map((c) => <StatCard key={c.title} {...c} />)}
      </motion.div>

      {/* Tables row */}
      <div className="grid grid-cols-1 gap-6">
        {/* Recent Loans */}
        <motion.div
          variants={tableVariants}
          initial="hidden"
          animate="visible"
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
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
                  <motion.tr
                    key={l.LOANID}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-6 py-3 text-white/80 font-medium">#{l.LOANID}</td>
                    <td className="px-6 py-3 text-white/50">
                      {l.ISSUEDATE ? new Date(l.ISSUEDATE).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-3 text-white/50">
                      {l.DUEDATE ? new Date(l.DUEDATE).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${loanStatusColor(l.STATUS)}`}>
                        {l.STATUS}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        
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
