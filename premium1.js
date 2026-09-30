const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'frontend', 'src');

// index.css
fs.writeFileSync(path.join(srcDir, 'index.css'), `
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    background-color: #050816;
    color: #F8FAFC;
    font-family: 'Inter', 'Poppins', sans-serif;
    overflow-x: hidden;
  }
}

.glass-panel {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

.glass-panel:hover {
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
`);

// tailwind.config.js
fs.writeFileSync(path.join(__dirname, 'frontend', 'tailwind.config.js'), `
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#050816',
        secondaryBg: '#0A1024',
        electric: '#3B82F6',
        cyan: '#22D3EE',
        violet: '#8B5CF6',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        textMain: '#F8FAFC',
        textMuted: '#94A3B8'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(circle at 50% -20%, rgba(59, 130, 246, 0.15), rgba(5, 8, 22, 0) 60%)'
      }
    },
  },
  plugins: [],
}
`);

// src/components/layout/AnimatedCursor.jsx
fs.writeFileSync(path.join(srcDir, 'components', 'layout', 'AnimatedCursor.jsx'), `
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function AnimatedCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    const handleMouseOver = (e) => {
      if (e.target.closest('button, a, input, select, .interactive')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };
    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-electric pointer-events-none z-50 hidden md:block"
      animate={{
        x: mousePosition.x - 16,
        y: mousePosition.y - 16,
        scale: isHovering ? 1.5 : 1,
        backgroundColor: isHovering ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.5 }}
    />
  );
}
`);

// src/components/layout/Sidebar.jsx
fs.writeFileSync(path.join(srcDir, 'components', 'layout', 'Sidebar.jsx'), `
import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Book, BookCopy, Users, Tags, Building2, MapPin, Truck, PenTool, LayoutDashboard, Calendar, FileText, DollarSign, Briefcase, LibraryBig, CreditCard } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/books', label: 'Books', icon: Book },
  { path: '/book-copies', label: 'Book Copies', icon: BookCopy },
  { path: '/authors', label: 'Authors', icon: Users },
  { path: '/categories', label: 'Categories', icon: Tags },
  { path: '/publishers', label: 'Publishers', icon: Building2 },
  { path: '/members', label: 'Members', icon: Users },
  { path: '/loans', label: 'Loans', icon: Calendar },
  { path: '/reservations', label: 'Reservations', icon: FileText },
  { path: '/fines', label: 'Fines', icon: DollarSign },
  { path: '/payments', label: 'Payments', icon: CreditCard },
  { path: '/librarians', label: 'Librarians', icon: Briefcase },
  { path: '/library-branches', label: 'Library Branches', icon: LibraryBig },
  { path: '/book-locations', label: 'Book Locations', icon: MapPin },
  { path: '/suppliers', label: 'Suppliers', icon: Truck },
  { path: '/written-by', label: 'Written By', icon: PenTool },
];

export default function Sidebar() {
  return (
    <div className="w-64 min-h-screen flex flex-col glass-panel flex-shrink-0 relative z-20 border-r-white/10 border-r border-t-0 border-b-0 border-l-0">
      <div className="p-6 flex items-center gap-3 font-bold text-lg text-white">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-electric to-violet flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <Book className="w-5 h-5 text-white" />
          </div>
        </motion.div>
        <div className="leading-tight">
          <div className="text-sm tracking-widest text-electric font-semibold">LIBRARY</div>
          <div className="text-xs text-textMuted">COMMAND CENTER</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {navItems.map(item => (
          <NavLink key={item.path} to={item.path}
            className={({ isActive }) => \`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 \${isActive ? 'text-white' : 'text-textMuted hover:text-white'}\`}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div layoutId="activeNav" className="absolute inset-0 bg-white/10 border border-white/20 rounded-lg"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-electric rounded-r-full shadow-[0_0_10px_#3b82f6]" />}
                <item.icon className={\`w-5 h-5 relative z-10 transition-transform duration-300 \${isActive ? 'text-electric' : 'group-hover:scale-110'}\`} />
                <span className="text-sm font-medium relative z-10">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
`);

// src/components/layout/Topbar.jsx
fs.writeFileSync(path.join(srcDir, 'components', 'layout', 'Topbar.jsx'), `
import React, { useEffect, useState } from 'react';
import { Bell, Search, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Topbar() {
  const [connected, setConnected] = useState(true);
  
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
            <span className={\`relative inline-flex rounded-full h-2.5 w-2.5 \${connected ? 'bg-success' : 'bg-danger'}\`}></span>
          </span>
          <span className={connected ? 'text-success' : 'text-danger'}>{connected ? 'Oracle Connected' : 'Disconnected'}</span>
        </div>
        <button className="text-textMuted hover:text-white transition-colors relative interactive">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-electric rounded-full"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet to-electric flex items-center justify-center interactive cursor-pointer">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    </motion.div>
  );
}
`);

// src/components/layout/Layout.jsx
fs.writeFileSync(path.join(srcDir, 'components', 'layout', 'Layout.jsx'), `
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AnimatedCursor from './AnimatedCursor';

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background relative selection:bg-electric/30">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none z-0"></div>
      <AnimatedCursor />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
`);
