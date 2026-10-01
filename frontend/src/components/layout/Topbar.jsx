import React, { useEffect, useState, useRef } from 'react';
import { Bell, Search, User, LogOut, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function Topbar({ onLogout, setActiveModule }) {
  const [connected, setConnected] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const checkHealth = async () => {
      try {
        await api.get('/health');
        if (active) setConnected(true);
      } catch (error) {
        if (active) setConnected(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const fetchSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(res.data.data || []);
        setShowDropdown(true);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSearch();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleResultClick = (result) => {
    setShowDropdown(false);
    setQuery('');
    // Remove the leading slash (e.g. "/books" -> "books")
    const mod = result.PATH.startsWith('/') ? result.PATH.slice(1) : result.PATH;
    setActiveModule(mod);
  };

  return (
    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="h-16 glass-panel border-x-0 border-t-0 flex items-center justify-between px-6 shrink-0 relative z-20">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-full max-w-md hidden md:block" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
          <input 
            id="global-search-input"
            type="text" 
            placeholder="Global Search (⌘K)" 
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
            onFocus={() => { if(query.trim()) setShowDropdown(true); }}
            className="w-full bg-black/20 border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-electric focus:bg-black/40 transition-all placeholder:text-textMuted"
          />
          <AnimatePresence>
            {showDropdown && query.trim() && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 mt-2 w-full bg-[#0c0c18] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto"
              >
                {loading ? (
                  <div className="p-4 text-center text-sm text-white/50">Searching...</div>
                ) : results.length > 0 ? (
                  <div className="py-2">
                    {results.map((r, i) => (
                      <button 
                        key={`${r.TYPE}-${r.ID}-${i}`}
                        onClick={() => handleResultClick(r)}
                        className="w-full px-4 py-2 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                      >
                        <div>
                          <p className="text-sm text-white font-medium truncate">{r.TITLE}</p>
                          <p className="text-xs text-white/40">{r.TYPE} #{r.ID}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-white/50">No results found</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="relative flex h-2.5 w-2.5">
            {connected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${connected ? 'bg-success' : 'bg-danger'}`}></span>
          </span>
          <span className={connected ? 'text-success' : 'text-danger'}>{connected ? 'Database Connected' : 'Disconnected'}</span>
        </div>
        <button className="text-textMuted hover:text-white transition-colors relative interactive">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-electric rounded-full"></span>
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-3.5 w-3.5" />
          Logout
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet to-electric flex items-center justify-center interactive cursor-pointer">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    </motion.div>
  );
}
