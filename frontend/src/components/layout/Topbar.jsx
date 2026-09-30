
import React, { useEffect, useState } from 'react';
import { Bell, Search, User, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';

export default function Topbar({ onLogout }) {
  const [connected, setConnected] = useState(false);

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

  return (
    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="h-16 glass-panel border-x-0 border-t-0 flex items-center justify-between px-6 shrink-0 relative z-20">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
          <input type="text" placeholder="Global Search (⌘K)" 
            className="w-full bg-black/20 border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-electric focus:bg-black/40 transition-all placeholder:text-textMuted"
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="relative flex h-2.5 w-2.5">
            {connected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${connected ? 'bg-success' : 'bg-danger'}`}></span>
          </span>
          <span className={connected ? 'text-success' : 'text-danger'}>{connected ? 'Oracle Connected' : 'Disconnected'}</span>
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
