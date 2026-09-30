const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'frontend', 'src');

// src/components/tables/CrudPage.jsx
fs.writeFileSync(path.join(srcDir, 'components', 'tables', 'CrudPage.jsx'), `
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit, Trash2, X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CrudPage({ schema }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
  }, [schema.endpoint]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async (searchQuery = '') => {
    setLoading(true);
    try {
      const res = await api.get(\`/\${schema.endpoint}?search=\${searchQuery}\`);
      setData(res.data.data || []);
    } catch (err) {
      showToast('Failed to fetch data', 'error');
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

  const handleDelete = async (item) => {
    if (!window.confirm('Delete record? This action cannot be undone.')) return;
    try {
      const path = Array.isArray(schema.pk) ? \`/\${schema.endpoint}/detail?\${getPkValue(item)}\` : \`/\${schema.endpoint}/\${getPkValue(item)}\`;
      await api.delete(path);
      showToast('Record deleted successfully');
      fetchData(search);
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
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
      const payload = { ...formData };
      
      // Critical BookID FIX: Delete single-PK on insert so Oracle can generate it!
      if (!editingItem && !Array.isArray(schema.pk)) {
        delete payload[schema.pk];
      }

      if (editingItem) {
        const path = Array.isArray(schema.pk) ? \`/\${schema.endpoint}/detail?\${getPkValue(editingItem)}\` : \`/\${schema.endpoint}/\${getPkValue(editingItem)}\`;
        await api.put(path, payload);
        showToast('Record updated successfully');
      } else {
        await api.post(\`/\${schema.endpoint}\`, payload);
        showToast('Record created successfully');
      }
      setModalOpen(false);
      fetchData(search);
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col h-full relative">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={\`fixed top-6 left-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl glass-panel \${toast.type === 'error' ? 'border-danger/30 text-danger' : 'border-success/30 text-success'}\`}>
            {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            <span className="font-medium text-sm">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">{schema.title}</h1>
          <p className="text-sm text-textMuted">Manage your digital {schema.title.toLowerCase()} collection.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <form onSubmit={handleSearch} className="relative flex-1 sm:w-72 group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-electric transition-colors" />
            <input 
              type="text" placeholder="Search..." 
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-electric focus:bg-white/10 transition-all placeholder:text-textMuted"
            />
          </form>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => openModal()} className="bg-electric hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-colors">
            <Plus className="w-4 h-4" /> Add New
          </motion.button>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-textMuted uppercase border-b border-white/10 bg-white/5">
              <tr>
                {schema.columns.map(c => <th key={c.key} className="px-6 py-4 font-semibold tracking-wider">{c.label}</th>)}
                <th className="px-6 py-4 font-semibold text-right tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={schema.columns.length + 1} className="px-6 py-12 text-center text-textMuted"><div className="inline-block w-6 h-6 border-2 border-electric/30 border-t-electric rounded-full animate-spin"></div></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={schema.columns.length + 1} className="px-6 py-16 text-center text-textMuted font-medium">No records found.</td></tr>
              ) : (
                data.map((item, i) => (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    {schema.columns.map(c => (
                      <td key={c.key} className="px-6 py-4 text-white">
                        {c.key === 'STATUS' || c.key === 'FINESTATUS' ? (
                           <span className={\`px-3 py-1 rounded-full text-xs font-medium bg-white/10 border border-white/20\`}>{item[c.key]}</span>
                        ) : item[c.key]}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(item)} className="p-2 text-cyan hover:bg-cyan/10 rounded-lg transition-colors interactive"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(item)} className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors interactive"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-secondaryBg border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col relative z-10 max-h-[90vh] overflow-hidden">
              
              <div className="flex justify-between items-center p-6 border-b border-white/10 shrink-0 bg-white/5">
                <h3 className="font-semibold text-xl text-white flex items-center gap-2">
                  <div className="w-2 h-6 bg-electric rounded-full"></div>
                  {editingItem ? 'Edit' : 'Create'} {schema.title}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-textMuted hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form id="crud-form" onSubmit={handleSubmit} className="space-y-5">
                  {schema.form.map(f => (
                    <div key={f.key}>
                      <label className="block text-sm font-medium text-textMuted mb-2">{f.label} {f.required && <span className="text-danger">*</span>}</label>
                      <input 
                        type={f.type || 'text'}
                        required={f.required}
                        disabled={editingItem && ((Array.isArray(schema.pk) ? schema.pk.includes(f.key) : schema.pk === f.key))}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-electric focus:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        value={formData[f.key] || ''}
                        onChange={e => setFormData({...formData, [f.key]: e.target.value})}
                      />
                    </div>
                  ))}
                </form>
              </div>

              <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end gap-4 shrink-0">
                <button onClick={() => setModalOpen(false)} type="button" className="px-5 py-2.5 text-sm font-medium text-white hover:text-white/80 transition-colors">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} form="crud-form" type="submit" disabled={submitting} 
                  className="px-6 py-2.5 text-sm font-medium text-white bg-electric rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.4)] disabled:opacity-50 flex items-center gap-2">
                  {submitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                  {submitting ? 'Saving...' : 'Save Record'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
`);
