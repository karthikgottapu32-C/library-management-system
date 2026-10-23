import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  DollarSign,
  Search,
  Filter,
  RefreshCw,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  QrCode,
  ShieldAlert,
  ArrowUpRight,
  Receipt,
  User,
  BookOpen,
  Calendar,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import PayFineModal3D from '../components/common/PayFineModal3D';
import ReceiptModal from '../components/common/ReceiptModal';
import CelebrationFireworks from '../components/common/CelebrationFireworks';

// 3D Tilt Card Component for Dashboard Metrics
function MetricCard3D({ title, value, subtext, icon: Icon, gradient, badgeText, badgeColor }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1000px',
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.12s ease-out'
      }}
      className="relative overflow-hidden rounded-2xl p-5 border border-white/10 shadow-xl transition-shadow duration-300"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
      }}
    >
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: gradient }}
      />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">{title}</span>
          <h3 className="text-2xl font-black text-white mt-1 tracking-tight font-mono">{value}</h3>
          {subtext && <p className="text-[11px] text-white/40 mt-1">{subtext}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: gradient }}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          {badgeText && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeColor}`}>
              {badgeText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FinesPaymentsPage() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'Unpaid', 'Paid'

  // Modals state
  const [activeFineToPay, setActiveFineToPay] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Fetch Fines & Payments data
  const fetchFines = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/fines-detailed', {
        params: {
          limit: 200,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchQuery.trim() || undefined
        }
      });
      if (res.data && res.data.success) {
        setFines(Array.isArray(res.data.data) ? res.data.data : []);
      } else {
        setFines([]);
      }
    } catch (err) {
      console.error('Failed to fetch fines:', err);
      setError(err.response?.data?.message || 'Could not load fines. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFines();
  };

  // Metrics computation
  const metrics = useMemo(() => {
    let totalOutstanding = 0;
    let totalCollected = 0;
    let unpaidCount = 0;
    let paidCount = 0;

    fines.forEach((f) => {
      const amount = Number(f.FINEAMOUNT || 0);
      const isPaid = (f.FINESTATUS || '').toLowerCase() === 'paid';
      if (isPaid) {
        paidCount++;
        totalCollected += Number(f.PAIDAMOUNT || amount);
      } else {
        unpaidCount++;
        totalOutstanding += amount;
      }
    });

    const totalFines = unpaidCount + paidCount;
    const collectionRate = totalFines > 0 ? Math.round((paidCount / totalFines) * 100) : 100;

    return {
      totalOutstanding,
      totalCollected,
      unpaidCount,
      paidCount,
      totalFines,
      collectionRate
    };
  }, [fines]);

  // Payment completed callback from modal
  const handlePaymentSuccess = (receiptPayload) => {
    setShowCelebration(true);
    // Refresh table in background
    fetchFines();
  };

  // View receipt for an existing paid fine
  const handleViewReceipt = (fine) => {
    const rNo = `REC-${new Date(fine.PAYMENTDATE || fine.FINEDATE || Date.now()).getFullYear()}-${String(fine.PAYMENTID || fine.FINEID).padStart(5, '0')}`;
    setActiveReceipt({
      receiptNo: rNo,
      paymentId: fine.PAYMENTID || fine.FINEID,
      transactionRef: fine.PAYMENTID ? `PAY-REF-${fine.PAYMENTID}` : `TXN-FINE-${fine.FINEID}`,
      fineId: fine.FINEID,
      memberId: fine.MEMBERID,
      memberName: fine.MEMBERNAME || `Member #${fine.MEMBERID}`,
      memberEmail: fine.MEMBEREMAIL || '',
      loanId: fine.LOANID,
      bookTitle: fine.BOOKTITLE || `Loan Item #${fine.LOANID}`,
      amount: fine.PAIDAMOUNT || fine.FINEAMOUNT,
      paymentMode: fine.PAYMENTMODE || 'Online Settlement',
      paymentDate: fine.PAYMENTDATE || fine.FINEDATE,
      paymentStatus: 'PAID'
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Global Fireworks celebration if triggered */}
      {showCelebration && (
        <CelebrationFireworks onComplete={() => setShowCelebration(false)} duration={3500} />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Payments & Fines Management
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Instant UPI / QR
                </span>
              </h1>
              <p className="text-white/40 text-xs">
                Real-time circulation penalties, UPI/QR settlement & official printable receipts
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchFines}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-white text-xs font-medium transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 3D Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard3D
          title="Outstanding Fines"
          value={`₹${metrics.totalOutstanding.toFixed(2)}`}
          subtext={`${metrics.unpaidCount} members with pending dues`}
          icon={AlertCircle}
          gradient="linear-gradient(135deg,#ef4444,#dc2626)"
          badgeText="Due Action"
          badgeColor="bg-red-500/15 text-red-400 border-red-500/30"
        />
        <MetricCard3D
          title="Collected Revenue"
          value={`₹${metrics.totalCollected.toFixed(2)}`}
          subtext={`${metrics.paidCount} fines successfully cleared`}
          icon={CheckCircle2}
          gradient="linear-gradient(135deg,#10b981,#059669)"
          badgeText="Settled"
          badgeColor="bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
        />
        <MetricCard3D
          title="Settlement Rate"
          value={`${metrics.collectionRate}%`}
          subtext={`${metrics.paidCount} of ${metrics.totalFines} total records`}
          icon={Sparkles}
          gradient="linear-gradient(135deg,#6366f1,#818cf8)"
          badgeText="Efficiency"
          badgeColor="bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
        />
        <MetricCard3D
          title="Active Fine Records"
          value={metrics.totalFines.toString()}
          subtext="Audited library loan penalties"
          icon={Receipt}
          gradient="linear-gradient(135deg,#f59e0b,#d97706)"
          badgeText="Database"
          badgeColor="bg-amber-500/15 text-amber-400 border-amber-500/30"
        />
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
        {/* Status filter tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10">
          {[
            { id: 'all', label: 'All Records' },
            { id: 'Unpaid', label: 'Unpaid Dues' },
            { id: 'Paid', label: 'Settled & Paid' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Member, Book, Loan ID, or Fine ID..."
            className="w-full h-9 pl-9 pr-20 rounded-xl text-xs text-white bg-white/[0.04] border border-white/10 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setTimeout(fetchFines, 50);
              }}
              className="absolute right-12 top-1/2 -translate-y-1/2 text-[10px] text-white/40 hover:text-white"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-indigo-300 bg-indigo-500/20 hover:bg-indigo-500/30 transition-colors"
          >
            Find
          </button>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchFines}
            className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-[11px] font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0e0f19]/70 backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-white/40 uppercase tracking-wider text-[10px] font-semibold">
                <th className="px-5 py-3.5">Fine Ref</th>
                <th className="px-5 py-3.5">Member Details</th>
                <th className="px-5 py-3.5">Loan & Book Item</th>
                <th className="px-5 py-3.5 text-right">Fine Amount</th>
                <th className="px-5 py-3.5">Fine Date</th>
                <th className="px-5 py-3.5 text-center">Fine Status</th>
                <th className="px-5 py-3.5">Payment Info</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-white/40">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full"
                      />
                      <span>Retrieving fines and payment ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : fines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-white/40">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400/40" />
                      <p className="text-sm font-medium text-white/70">No fine records found.</p>
                      <p className="text-xs text-white/30">
                        {searchQuery ? 'Try adjusting your search criteria.' : 'Great! All library accounts are in good standing.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                fines.map((fine, idx) => {
                  const isPaid = (fine.FINESTATUS || '').toLowerCase() === 'paid';
                  const amount = Number(fine.FINEAMOUNT || 0).toFixed(2);
                  const fineDateStr = fine.FINEDATE ? new Date(fine.FINEDATE).toLocaleDateString() : '—';
                  const paymentDateStr = fine.PAYMENTDATE ? new Date(fine.PAYMENTDATE).toLocaleDateString() : '—';

                  return (
                    <motion.tr
                      key={fine.FINEID}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Fine ID */}
                      <td className="px-5 py-4 font-mono font-medium text-white/70">
                        #{fine.FINEID}
                      </td>

                      {/* Member Info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 flex-shrink-0">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-semibold text-white truncate max-w-[150px]">
                              {fine.MEMBERNAME || `Member #${fine.MEMBERID}`}
                            </p>
                            <p className="text-[11px] text-white/40 font-mono">
                              ID: #{fine.MEMBERID} {fine.MEMBERTYPE ? `• ${fine.MEMBERTYPE}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Loan & Book Title */}
                      <td className="px-5 py-4">
                        <p className="font-medium text-white/90 truncate max-w-[200px]" title={fine.BOOKTITLE}>
                          {fine.BOOKTITLE || `Loan Item #${fine.LOANID}`}
                        </p>
                        <p className="text-[11px] text-white/40 font-mono mt-0.5">
                          Loan #{fine.LOANID} {fine.DUEDATE ? `• Due: ${new Date(fine.DUEDATE).toLocaleDateString()}` : ''}
                        </p>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-bold text-emerald-400 font-mono">
                          ₹{amount}
                        </span>
                      </td>

                      {/* Fine Date */}
                      <td className="px-5 py-4 text-white/60">
                        {fineDateStr}
                      </td>

                      {/* Fine Status */}
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            isPaid
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-red-500/15 text-red-400 border-red-500/30'
                          }`}
                        >
                          {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>{isPaid ? 'PAID' : 'UNPAID'}</span>
                        </span>
                      </td>

                      {/* Payment info */}
                      <td className="px-5 py-4">
                        {isPaid ? (
                          <div>
                            <p className="text-white/80 font-medium text-[11px] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>{fine.PAYMENTMODE || 'Online Settlement'}</span>
                            </p>
                            <p className="text-[10px] text-white/40 font-mono mt-0.5">
                              {paymentDateStr} {fine.PAYMENTID ? `• #${fine.PAYMENTID}` : ''}
                            </p>
                          </div>
                        ) : (
                          <span className="text-white/30 text-[11px] italic">Awaiting Payment</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        {isPaid ? (
                          <button
                            type="button"
                            onClick={() => handleViewReceipt(fine)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 transition-all hover:scale-105"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Receipt</span>
                          </button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => setActiveFineToPay(fine)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all"
                            style={{
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              boxShadow: '0 0 15px rgba(16,185,129,0.3)'
                            }}
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Pay Fine</span>
                          </motion.button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Pay Fine Modal */}
      {activeFineToPay && (
        <PayFineModal3D
          fine={activeFineToPay}
          onClose={() => setActiveFineToPay(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Active Receipt Modal for inspection / re-printing */}
      {activeReceipt && (
        <ReceiptModal
          receipt={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}
    </div>
  );
}
