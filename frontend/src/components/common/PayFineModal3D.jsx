import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, CreditCard, Banknote, Globe, Copy, Check, X, ShieldCheck, ArrowRight, Printer, AlertCircle, Sparkles } from 'lucide-react';
import api from '../../services/api';
import CelebrationFireworks from './CelebrationFireworks';
import ReceiptModal from './ReceiptModal';

export default function PayFineModal3D({ fine, onClose, onPaymentSuccess }) {
  const [selectedMethod, setSelectedMethod] = useState('UPI / QR Code');
  const [transactionRef, setTransactionRef] = useState(`UPI-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Success state
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // 3D Card tilt state
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  if (!fine) return null;

  const fineAmount = Number(fine.FINEAMOUNT || 0).toFixed(2);
  const upiId = 'central.library@bank';
  const upiUrl = `upi://pay?pa=${upiId}&pn=Central+Library&am=${fineAmount}&tn=Fine+Receipt+${fine.FINEID}&cu=INR`;

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirmPayment = async () => {
    setSubmitting(true);
    setErrorMessage('');
    try {
      const res = await api.post(`/fines/${fine.FINEID}/pay`, {
        paymentMode: selectedMethod,
        transactionRef: transactionRef
      });

      if (res.data.success) {
        setIsSuccess(true);
        setPaymentResult(res.data.data);
        setShowFireworks(true);
        if (onPaymentSuccess) {
          onPaymentSuccess(res.data.data);
        }
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Payment processing failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Fireworks Burst on Success */}
      {showFireworks && (
        <CelebrationFireworks onComplete={() => setShowFireworks(false)} duration={3800} />
      )}

      {/* Printable Receipt Modal */}
      {showReceiptModal && (
        <ReceiptModal
          receipt={paymentResult}
          onClose={() => setShowReceiptModal(false)}
        />
      )}

      <AnimatePresence>
        <div className="fixed inset-0 flex items-center justify-center z-[9995] p-4 overflow-y-auto">
          {/* Backdrop with cinematic blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative z-10 w-full max-w-xl rounded-2xl overflow-hidden flex flex-col my-8 shadow-2xl bg-[#0d0e18] border border-white/10"
            style={{
              boxShadow: '0 25px 60px -15px rgba(0,0,0,0.8), 0 0 50px rgba(99,102,241,0.15)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 via-transparent to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {isSuccess ? 'Payment Confirmation' : 'Library Fine Settlement'}
                  </h3>
                  <p className="text-[11px] text-white/40">Fine Record #{fine.FINEID}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {!isSuccess ? (
              /* ================= PAYMENT WORKFLOW ================= */
              <div className="p-6 space-y-5">
                {/* 3D Perspective Fine Summary Card */}
                <div
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    perspective: '1000px',
                    transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                    transition: 'transform 0.15s ease-out'
                  }}
                  className="rounded-2xl p-5 bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Fine Invoice</span>
                      <h4 className="text-lg font-bold text-white mt-0.5">{fine.MEMBERNAME || `Member #${fine.MEMBERID}`}</h4>
                      <p className="text-xs text-white/50 mt-0.5">Book: <span className="text-white/80 font-medium">{fine.BOOKTITLE || `Loan #${fine.LOANID}`}</span></p>
                      <p className="text-[11px] text-white/40 mt-1">Loan Ref: #{fine.LOANID} • Due: {fine.DUEDATE ? new Date(fine.DUEDATE).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Fine Amount</span>
                      <p className="text-3xl font-extrabold text-emerald-400 font-mono mt-0.5">₹{fineAmount}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                        {fine.FINESTATUS || 'Unpaid'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods Selection */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2 block">
                    Choose Payment Method
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'UPI / QR Code', icon: QrCode, label: 'UPI / QR' },
                      { id: 'Debit / Credit Card', icon: CreditCard, label: 'Card' },
                      { id: 'Cash', icon: Banknote, label: 'Cash' },
                      { id: 'Online Transfer', icon: Globe, label: 'Net Bank' }
                    ].map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMethod(m.id)}
                        className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-medium border transition-all ${
                          selectedMethod === m.id
                            ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                            : 'bg-white/[0.02] border-white/10 text-white/50 hover:text-white hover:bg-white/[0.05]'
                        }`}
                      >
                        <m.icon className="w-4 h-4" />
                        <span className="truncate text-[11px]">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* QR Code Section (if UPI / QR Code chosen) */}
                {selectedMethod === 'UPI / QR Code' && (
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center text-center space-y-3">
                    <div className="p-3 bg-white rounded-2xl shadow-2xl flex flex-col items-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=2&data=${encodeURIComponent(upiUrl)}`}
                        alt="Scan UPI QR Code"
                        className="w-40 h-40 object-contain rounded-lg"
                      />
                      <span className="text-[10px] font-bold text-slate-700 mt-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" /> Scan with GPay / PhonePe / Paytm
                      </span>
                    </div>

                    <div className="w-full space-y-1">
                      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white/[0.03] border border-white/10">
                        <input
                          readOnly
                          value={upiUrl}
                          className="w-full bg-transparent text-[11px] text-white/60 font-mono px-2 focus:outline-none truncate"
                        />
                        <button
                          type="button"
                          onClick={handleCopyUPI}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium text-indigo-300 bg-indigo-500/20 hover:bg-indigo-500/30 flex items-center gap-1 transition-colors flex-shrink-0"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reference ID Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                      Transaction / Reference ID
                    </label>
                    <button
                      type="button"
                      onClick={() => setTransactionRef(`UPI-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`)}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      Regenerate Demo Ref
                    </button>
                  </div>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="e.g. UPI/329184920194 or Cash Receipt No."
                    className="w-full h-9 rounded-xl px-3 text-xs text-white/90 bg-white/[0.04] border border-white/10 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-10 px-4 rounded-xl text-xs text-white/50 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirmPayment}
                    disabled={submitting}
                    className="h-10 px-6 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg,#10b981,#059669)',
                      boxShadow: '0 0 25px rgba(16,185,129,0.35)'
                    }}
                  >
                    {submitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Confirm Payment (₹{fineAmount})</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            ) : (
              /* ================= SUCCESS STATE ================= */
              <div className="p-8 flex flex-col items-center text-center space-y-5">
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-xl"
                  style={{ boxShadow: '0 0 40px rgba(16,185,129,0.5)' }}
                >
                  <Check className="w-8 h-8 stroke-[3]" />
                </motion.div>

                <div>
                  <span className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase">
                    Transaction Complete
                  </span>
                  <h3 className="text-2xl font-black text-white mt-1">✓ PAYMENT SUCCESSFUL</h3>
                  <p className="text-xs text-white/50 mt-1">The fine record has been marked as PAID in database.</p>
                </div>

                {/* Summary Box */}
                <div className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 text-left space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/40">Receipt Number</span>
                    <span className="text-white font-mono font-bold text-indigo-400">{paymentResult?.receiptNo}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/40">Payment ID</span>
                    <span className="text-white font-mono">#{paymentResult?.paymentId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/40">Member</span>
                    <span className="text-white font-medium">{paymentResult?.memberName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/40">Book Item</span>
                    <span className="text-white font-medium truncate max-w-[220px]">{paymentResult?.bookTitle}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/40">Method / Ref</span>
                    <span className="text-white/80 font-mono text-[11px] truncate">{paymentResult?.paymentMode} ({paymentResult?.transactionRef})</span>
                  </div>
                  <div className="flex justify-between py-1 pt-2 items-center">
                    <span className="text-white/60 font-semibold">Total Amount Settled</span>
                    <span className="text-xl font-bold text-emerald-400 font-mono">₹{Number(paymentResult?.amount || 0).toFixed(2)}</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3 w-full">
                  <button
                    onClick={() => setShowReceiptModal(true)}
                    className="flex-1 h-11 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
                  >
                    <Printer className="w-4 h-4" />
                    <span>PRINT OFFICIAL RECEIPT</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="px-5 h-11 rounded-xl text-xs font-medium text-white/50 hover:text-white bg-white/[0.05] hover:bg-white/10 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </AnimatePresence>
    </>
  );
}
