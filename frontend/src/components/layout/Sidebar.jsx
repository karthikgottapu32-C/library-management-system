import React from 'react';
import { motion } from 'framer-motion';
import {
  Book, BookCopy, Users, Tags, Building2, MapPin,
  Truck, PenTool, LayoutDashboard, Calendar, FileText,
  DollarSign, Briefcase, LibraryBig, CreditCard, Library
} from 'lucide-react';

const navGroups = [
  {
    label: 'Overview',
    items: [{ path: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }]
  },
  {
    label: 'Catalog',
    items: [
      { path: 'books', label: 'Books', icon: Book },
      { path: 'book-copies', label: 'Book Copies', icon: BookCopy },
      { path: 'authors', label: 'Authors', icon: Users },
      { path: 'categories', label: 'Categories', icon: Tags },
      { path: 'publishers', label: 'Publishers', icon: Building2 }
    ]
  },
  {
    label: 'Circulation',
    items: [
      { path: 'members', label: 'Members', icon: Users },
      { path: 'loans', label: 'Loans', icon: Calendar },
      { path: 'reservations', label: 'Reservations', icon: FileText },
      { path: 'fines', label: 'Fines', icon: DollarSign },
      { path: 'payments', label: 'Payments', icon: CreditCard }
    ]
  },
  {
    label: 'Administration',
    items: [
      { path: 'librarians', label: 'Librarians', icon: Briefcase },
      { path: 'suppliers', label: 'Suppliers', icon: Truck }
    ]
  }
];

export default function Sidebar({ activeModule, setActiveModule }) {
  return (
    <div
      className="w-60 min-h-screen flex flex-col flex-shrink-0 relative z-20"
      style={{ background: 'rgba(10,10,20,0.85)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="px-5 py-5 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)', boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}
        >
          <Library className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-xs font-bold tracking-widest text-indigo-400 uppercase">Library</div>
          <div className="text-[10px] text-white/30 tracking-wide">Management System</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/20">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const isActive = activeModule === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => setActiveModule(item.path)}
                    className={`w-full text-left group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      isActive
                        ? 'text-white font-medium'
                        : 'text-white/40 hover:text-white/80'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-lg"
                        style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    {isActive && (
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                        style={{ background: '#818cf8', boxShadow: '0 0 8px #818cf8' }}
                      />
                    )}
                    <item.icon
                      className={`w-4 h-4 relative z-10 transition-colors duration-200 ${
                        isActive ? 'text-indigo-400' : 'text-white/30 group-hover:text-white/60'
                      }`}
                    />
                    <span className="relative z-10 truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
