import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit, Trash2, X, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_COLORS = {
  Active:     'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  Returned:   'bg-sky-500/15 text-sky-400 border-sky-500/25',
  Overdue:    'bg-red-500/15 text-red-400 border-red-500/25',
  Available:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  Issued:     'bg-amber-500/15 text-amber-400 border-amber-500/25',
  Lost:       'bg-red-500/15 text-red-400 border-red-500/25',
  Damaged:    'bg-orange-500/15 text-orange-400 border-orange-500/25',
  Pending:    'bg-amber-500/15 text-amber-400 border-amber-500/25',
  Fulfilled:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  Cancelled:  'bg-white/10 text-white/40 border-white/10',
  Paid:       'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  Unpaid:     'bg-red-500/15 text-red-400 border-red-500/25',
};

function StatusBadge({ value }) {
  const cls = STATUS_COLORS[value] || 'bg-white/10 text-white/50 border-white/10';
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${cls}`}>
      {value}
    </span>
  );
}

function Toast({ toast }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -16, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -16, x: '-50%' }}
          className={`fixed top-5 left-1/2 z-[9997] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium
            ${toast.type === 'error'
              ? 'bg-red-950/90 border border-red-500/30 text-red-300'
              : 'bg-emerald-950/90 border border-emerald-500/30 text-emerald-300'
            } backdrop-blur-md`}
        >
          {toast.type === 'error'
            ? <AlertCircle className="w-4 h-4 flex-shrink-0" />
            : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          }
          {toast.msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function CrudPage({ schema }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 50;

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [viewDetails, setViewDetails] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [refData, setRefData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = useCallback(async (searchQuery = '', pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: LIMIT, page: pageNum });
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      const res = await api.get(`/${schema.endpoint}?${params}`);
      const rows = res.data.data || [];
      setData(rows);
      setHasMore(rows.length === LIMIT);
    } catch {
      showToast('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  }, [schema.endpoint]);

  
  useEffect(() => {
    const fetchRefs = async () => {
      if (!schema.form) return;
      const refs = schema.form.filter(f => f.type === 'reference');
      const newRefData = { ...refData };
      let changed = false;
      for (const ref of refs) {
        if (!newRefData[ref.endpoint]) {
          try {
            const res = await api.get('/' + ref.endpoint + '?limit=1000');
            newRefData[ref.endpoint] = res.data.data || [];
            changed = true;
          } catch (e) {
            console.error('Failed to fetch ref', ref.endpoint);
          }
        }
      }
      if (changed) setRefData(newRefData);
    };
    fetchRefs();
  }, [schema]);

  useEffect(() => {
    setPage(1);
    setSearch('');
    fetchData('', 1);
  }, [schema.endpoint]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData(search, 1);
  };

  const goPage = (dir) => {
    const next = page + dir;
    if (next < 1) return;
    setPage(next);
    fetchData(search, next);
  };

  const getPkValue = (item) => {
    if (Array.isArray(schema.pk)) return schema.pk.map(k => `${k}=${item[k]}`).join('&');
    return item[schema.pk];
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete this record? This cannot be undone.`)) return;
    try {
      const path = Array.isArray(schema.pk)
        ? `/${schema.endpoint}/detail?${getPkValue(item)}`
        : `/${schema.endpoint}/${getPkValue(item)}`;
      await api.delete(path);
      showToast('Record deleted successfully');
      fetchData(search, page);
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const openModal = (item = null) => {
    setEditingItem(item);
    // For edit: pre-fill form. For create: empty.
    setFormData(item ? { ...item } : {});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData };

      // Remove auto-PK for insert
      if (!editingItem && !Array.isArray(schema.pk)) {
        delete payload[schema.pk];
      }

      if (editingItem) {
        const path = Array.isArray(schema.pk)
          ? `/${schema.endpoint}/detail?${getPkValue(editingItem)}`
          : `/${schema.endpoint}/${getPkValue(editingItem)}`;
        await api.put(path, payload);
        showToast('Record updated successfully');
      } else {
        await api.post(`/${schema.endpoint}`, payload);
        showToast('Record created successfully');
      }
      setModalOpen(false);
      fetchData(search, page);
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const isStatusKey = (key) => ['STATUS', 'FINESTATUS', 'MEMBERTYPE'].includes(key.toUpperCase());
  const isDateKey = (key) => key.toLowerCase().includes('date') || key.toLowerCase().includes('joined');

  const formatCell = (item, col) => {
    const val = item[col.key];
    if (val == null || val === '') return <span className="text-white/20">—</span>;
    if (isStatusKey(col.key)) return <StatusBadge value={val} />;
    if (isDateKey(col.key)) {
      try { return <span className="text-white/50">{new Date(val).toLocaleDateString()}</span>; }
      catch { return <span className="text-white/50">{val}</span>; }
    }
    return <span className="text-white/80">{String(val)}</span>;
  };

  return (
    <motion.div
      key={schema.endpoint}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col h-full"
    >
      <Toast toast={toast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-0.5">{schema.title}</h1>
          <p className="text-xs text-white/30">
            {loading ? 'Loading…' : `${data.length} record${data.length !== 1 ? 's' : ''}${page > 1 ? ` — page ${page}` : ''}`}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <form onSubmit={handleSearch} className="relative flex-1 sm:w-64 group">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 rounded-xl pl-9 pr-3 text-sm text-white/80 placeholder:text-white/20 focus:outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </form>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => openModal()}
            className="h-9 px-4 rounded-xl text-sm font-medium text-white flex items-center gap-1.5 interactive"
            style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)', boxShadow: '0 0 16px rgba(99,102,241,0.3)' }}
          >
            <Plus className="w-3.5 h-3.5" /> Add New
          </motion.button>
        </div>
      </div>

      {/* Table */}
      <div
        className="flex-1 rounded-2xl overflow-hidden flex flex-col"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {schema.columns.map(c => (
                  <th key={c.key} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-white/25">
                    {c.label}
                  </th>
                ))}
                <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-white/25">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={schema.columns.length + 1} className="px-5 py-16 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="inline-block w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full"
                    />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={schema.columns.length + 1} className="px-5 py-16 text-center text-white/20 text-sm">
                    No records found.
                  </td>
                </tr>
              ) : data.map((item, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.025, 0.4) }}
                  className="group transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {schema.columns.map(c => (
                    <td key={c.key} className="px-5 py-3">
                      {formatCell(item, c)}
                    </td>
                  ))}
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      
                      <button
                        onClick={() => {
                          setViewingItem(item);
                          setViewModalOpen(true);
                          // Fetch extra details if needed, e.g. for books
                          if (schema.endpoint === 'books') {
                            api.get(`/book-copies?BOOKID=${item.BOOKID}`).then(res => {
                              setViewDetails(res.data.data);
                            });
                          }
                        }}
                        className="p-1.5 rounded-lg text-indigo-400 hover:bg-indigo-500/10 transition-colors interactive"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openModal(item)}
                        className="p-1.5 rounded-lg text-indigo-400 hover:bg-indigo-500/10 transition-colors interactive"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors interactive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <span className="text-xs text-white/20">Page {page}</span>
          <div className="flex gap-1">
            <button
              onClick={() => goPage(-1)}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/5 transition-colors interactive"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => goPage(1)}
              disabled={!hasMore}
              className="p-1.5 rounded-lg text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/5 transition-colors interactive"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      
      {/* View Modal */}
      <AnimatePresence>
        {viewModalOpen && viewingItem && (
          <div className="fixed inset-0 flex items-center justify-center z-[9996] p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setViewModalOpen(false); setViewingItem(null); setViewDetails(null); }}
              className="absolute inset-0 backdrop-blur-sm"
              style={{ background: 'rgba(0,0,0,0.7)' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="relative z-10 w-full max-w-lg rounded-2xl overflow-hidden flex flex-col max-h-[88vh]"
              style={{ background: 'rgba(12,12,24,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom,#10b981,#34d399)' }} />
                  {schema.title} Details
                </h3>
                <button
                  onClick={() => { setViewModalOpen(false); setViewingItem(null); setViewDetails(null); }}
                  className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors interactive"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto px-6 py-5 space-y-4">
                {schema.columns.map(col => (
                  <div key={col.key} className="flex flex-col">
                    <span className="text-xs text-white/40 uppercase tracking-wider">{col.label}</span>
                    <span className="text-sm text-white/90 mt-1">{viewingItem[col.key] || '-'}</span>
                  </div>
                ))}
                
                {/* Custom details injection */}
                {schema.endpoint === 'books' && viewDetails && (
                  <div className="mt-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <h4 className="text-sm font-semibold text-white mb-3">Inventory & Copies</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                        <div className="text-xs text-white/40 mb-1">Total Physical Copies</div>
                        <div className="text-lg text-white font-bold">{viewDetails.length}</div>
                      </div>
                      <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                        <div className="text-xs text-emerald-400/70 mb-1">Available Copies</div>
                        <div className="text-lg text-emerald-400 font-bold">
                          {viewDetails.filter(c => c.STATUS === 'Available').length}
                        </div>
                      </div>
                      <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                        <div className="text-xs text-amber-400/70 mb-1">Issued Copies</div>
                        <div className="text-lg text-amber-400 font-bold">
                          {viewDetails.filter(c => c.STATUS === 'Issued').length}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-[9996] p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 backdrop-blur-sm"
              style={{ background: 'rgba(0,0,0,0.7)' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="relative z-10 w-full max-w-md rounded-2xl overflow-hidden flex flex-col max-h-[88vh]"
              style={{ background: 'rgba(12,12,24,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom,#6366f1,#818cf8)' }} />
                  {editingItem ? 'Edit' : 'Create'} {schema.title}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors interactive"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <div className="overflow-y-auto px-6 py-5">
                <form id="crud-form" onSubmit={handleSubmit} className="space-y-4">
                  {schema.form.map(f => {
                    const isPK = Array.isArray(schema.pk)
                      ? schema.pk.includes(f.key)
                      : schema.pk === f.key;
                    const isDisabledOnEdit = editingItem && isPK;
                    const fieldStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' };

                    return (
                      <div key={f.key}>
                        <label className="block text-xs font-medium text-white/40 mb-1.5">
                          {f.label}
                          {f.required && <span className="text-red-400 ml-1">*</span>}
                        </label>
                        
                        {f.type === 'reference' ? (
                          <select
                            multiple={f.multiple}
                            required={f.required}
                            disabled={isDisabledOnEdit}
                            className="w-full rounded-xl px-3 py-2 text-sm text-white/80 focus:outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed custom-scrollbar"
                            style={{ ...fieldStyle, minHeight: f.multiple ? '100px' : '36px' }}
                            value={formData[f.key] || (f.multiple ? [] : '')}
                            onChange={e => {
                              if (f.multiple) {
                                const values = Array.from(e.target.selectedOptions, option => option.value);
                                setFormData({ ...formData, [f.key]: values.join(',') });
                              } else {
                                setFormData({ ...formData, [f.key]: e.target.value });
                              }
                            }}
                          >
                            {!f.multiple && <option value="" style={{ background: '#0c0c18' }}>-- Select {f.label} --</option>}
                            {(refData[f.endpoint] || []).map(opt => (
                              <option key={opt[f.valueKey]} value={opt[f.valueKey]} style={{ background: '#0c0c18', padding: '4px' }}>
                                {opt[f.labelKey]}
                              </option>
                            ))}
                          </select>
                        ) : f.type === 'select' ? (

                          <select
                            required={f.required}
                            disabled={isDisabledOnEdit}
                            className="w-full h-9 rounded-xl px-3 text-sm text-white/80 focus:outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            style={fieldStyle}
                            value={formData[f.key] != null ? formData[f.key] : ''}
                            onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                            onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; }}
                            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                          >
                            <option value="" style={{ background: '#0c0c18' }}>— Select —</option>
                            {(f.options || []).map(opt => (
                              <option key={opt} value={opt} style={{ background: '#0c0c18' }}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={f.type || 'text'}
                            required={f.required}
                            disabled={isDisabledOnEdit}
                            className="w-full h-9 rounded-xl px-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            style={fieldStyle}
                            value={formData[f.key] != null ? formData[f.key] : ''}
                            onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                            onFocus={e => { if (!isDisabledOnEdit) e.target.style.borderColor = 'rgba(99,102,241,0.5)'; }}
                            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                          />
                        )}
                      </div>
                    );
                  })}
                </form>
              </div>

              {/* Footer */}
              <div
                className="flex justify-end gap-3 px-6 py-4"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}
              >
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="h-9 px-4 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors interactive"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  form="crud-form"
                  type="submit"
                  disabled={submitting}
                  className="h-9 px-5 rounded-xl text-sm font-medium text-white flex items-center gap-2 disabled:opacity-50 interactive"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)' }}
                >
                  {submitting && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                      className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  )}
                  {submitting ? 'Saving…' : 'Save Record'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
