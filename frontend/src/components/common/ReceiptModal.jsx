import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, Download, CheckCircle, X, Library, ShieldCheck, Calendar, User, Book, CreditCard, Hash } from 'lucide-react';

export default function ReceiptModal({ receipt, onClose }) {
  const receiptRef = useRef(null);

  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = receipt.paymentDate
    ? new Date(receipt.paymentDate).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : new Date().toLocaleString();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          className="relative z-10 w-full max-w-xl rounded-2xl overflow-hidden flex flex-col my-8 shadow-2xl bg-[#0c0d14] border border-white/10"
        >
          {/* Top Actions Bar (Hidden during print) */}
          <div className="flex items-center justify-between px-6 py-3.5 bg-white/[0.04] border-b border-white/10 print:hidden">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Official Library Payment Receipt</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md"
                title="Print or Save as PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Printable Receipt Body */}
          <div
            ref={receiptRef}
            id="printable-receipt"
            className="p-8 bg-white text-slate-900 rounded-b-2xl font-sans"
          >
            {/* Receipt Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-800 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shadow">
                  <Library className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                    Central Library Management
                  </h1>
                  <p className="text-xs text-slate-500 font-medium tracking-wide">
                    Digital Circulation & Fine Settlement Division
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  PAID IN FULL
                </span>
                <p className="text-xs font-bold text-slate-900 mt-1.5 font-mono">
                  {receipt.receiptNo || `REC-2026-${receipt.paymentId || '0001'}`}
                </p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-200 text-xs">
              <div>
                <p className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">Billed To (Member)</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{receipt.memberName || 'Library Patron'}</p>
                <p className="text-slate-600 font-mono mt-0.5">Member ID: #{receipt.memberId}</p>
                {receipt.memberEmail && <p className="text-slate-500">{receipt.memberEmail}</p>}
              </div>
              <div className="text-right">
                <p className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">Payment Details</p>
                <p className="font-semibold text-slate-800 mt-0.5">{formattedDate}</p>
                <p className="text-slate-600 font-mono">Payment ID: #{receipt.paymentId}</p>
                <p className="text-slate-600 font-mono text-[11px] truncate">Ref: {receipt.transactionRef || 'N/A'}</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="py-5 border-b border-slate-200">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                    <th className="pb-2">Description / Loan Reference</th>
                    <th className="pb-2 text-center">Fine ID</th>
                    <th className="pb-2 text-center">Payment Mode</th>
                    <th className="pb-2 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3">
                      <p className="font-bold text-slate-900 text-sm">{receipt.bookTitle || 'Overdue Book Fine'}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">Loan Reference: #{receipt.loanId}</p>
                    </td>
                    <td className="py-3 text-center font-mono font-medium text-slate-700">#{receipt.fineId}</td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                        {receipt.paymentMode || 'UPI / QR Code'}
                      </span>
                    </td>
                    <td className="py-3 text-right font-black text-slate-900 text-sm">
                      ₹{Number(receipt.amount).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total Block */}
            <div className="pt-4 flex justify-between items-center pb-6 border-b border-slate-200">
              <div className="text-slate-500 text-xs">
                <p className="font-medium text-emerald-700 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Electronic Transaction Verified
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">All outstanding fines for this record cleared.</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 font-medium mr-3">Total Amount</span>
                <span className="text-2xl font-black text-slate-900 font-mono">
                  ₹{Number(receipt.amount).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Footer / Seal & Signature */}
            <div className="pt-5 flex items-end justify-between text-[11px] text-slate-400">
              <div>
                <p className="font-semibold text-slate-600">Central Library Authority</p>
                <p className="text-[10px]">Computer generated official fine invoice.</p>
                <p className="text-[10px] text-slate-400">No physical signature required.</p>
              </div>
              <div className="text-center border-t border-slate-300 pt-2 px-6">
                <p className="font-bold text-slate-800 text-xs">Authorized Cashier</p>
                <p className="text-[10px] text-slate-500">Circulation Desk</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            margin: 0;
            padding: 24px;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </AnimatePresence>
  );
}
