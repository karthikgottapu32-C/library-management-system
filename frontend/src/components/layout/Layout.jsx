
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AnimatedCursor from './AnimatedCursor';

export default function Layout({ onLogout }) {
  const [activeModule, setActiveModule] = useState('dashboard');

  return (
    <div className="flex h-screen overflow-hidden bg-background relative selection:bg-electric/30">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none z-0"></div>
      <AnimatedCursor />
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        <Topbar onLogout={onLogout} setActiveModule={setActiveModule} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet context={{ activeModule, setActiveModule }} />
        </main>
      </div>
    </div>
  );
}
