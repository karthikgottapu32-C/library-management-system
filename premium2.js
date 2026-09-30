const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'frontend', 'src');

// src/components/dashboard/Hero3D.jsx
fs.writeFileSync(path.join(srcDir, 'components', 'dashboard', 'Hero3D.jsx'), `
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PresentationControls } from '@react-three/drei';

function BookGeometry({ position, color, rotation }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = rotation[1] + Math.sin(t / 2) * 0.1;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1} position={position}>
      <mesh ref={meshRef} rotation={rotation} castShadow receiveShadow>
        <boxGeometry args={[1.5, 2.2, 0.3]} />
        <meshStandardMaterial color={color} roughness={0.1} metalness={0.8} />
      </mesh>
    </Float>
  );
}

export default function Hero3D() {
  return (
    <div className="absolute right-0 top-0 w-96 h-96 pointer-events-none opacity-60">
      <Canvas shadows camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3B82F6" />
        <pointLight position={[10, -10, 10]} intensity={0.5} color="#8B5CF6" />
        <PresentationControls global config={{ mass: 2, tension: 500 }} snap={{ mass: 4, tension: 1500 }}>
          <BookGeometry position={[-1, 0.5, 0]} color="#3B82F6" rotation={[0, 0.5, 0]} />
          <BookGeometry position={[0.5, -0.5, -1]} color="#8B5CF6" rotation={[0.2, -0.3, 0.1]} />
          <BookGeometry position={[1.5, 1, -2]} color="#22D3EE" rotation={[-0.1, 0.2, -0.2]} />
        </PresentationControls>
      </Canvas>
    </div>
  );
}
`);

// src/pages/Dashboard.jsx
fs.writeFileSync(path.join(srcDir, 'pages', 'Dashboard.jsx'), `
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Book, Users, Calendar, DollarSign, AlertCircle, Building, Bookmark, Sparkles } from 'lucide-react';
import Hero3D from '../components/dashboard/Hero3D';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentLoans, setRecentLoans] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stRes, loansRes, booksRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/recent-loans'),
          api.get('/dashboard/recent-books')
        ]);
        setStats(stRes.data.data);
        setRecentLoans(loansRes.data.data);
        setRecentBooks(booksRes.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="w-10 h-10 border-4 border-electric/30 border-t-electric rounded-full animate-spin"></div>
    </div>
  );

  const StatCard = ({ title, value, icon: Icon, color, delay }) => (
    <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} className="glass-panel p-6 rounded-2xl relative overflow-hidden group interactive cursor-pointer">
      <div className={\`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 \${color.replace('text-', 'bg-')}\`}></div>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-textMuted mb-1">{title}</p>
          <motion.p initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + delay, type: 'spring' }} className="text-3xl font-bold text-white tracking-tight">
            {value}
          </motion.p>
        </div>
        <div className={\`p-3 rounded-xl bg-white/5 border border-white/10 \${color}\`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="relative">
      <Hero3D />
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 relative z-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-2 flex items-center gap-3">
          Library Intelligence <Sparkles className="w-6 h-6 text-electric" />
        </h1>
        <p className="text-textMuted text-lg">Your digital library, beautifully organized.</p>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 relative z-10">
        <StatCard title="Total Books" value={stats?.totalBooks} icon={Book} color="text-electric" delay={0.1} />
        <StatCard title="Active Loans" value={stats?.activeLoans} icon={Calendar} color="text-cyan" delay={0.2} />
        <StatCard title="Overdue Loans" value={stats?.overdueLoans} icon={AlertCircle} color="text-danger" delay={0.3} />
        <StatCard title="Total Members" value={stats?.totalMembers} icon={Users} color="text-violet" delay={0.4} />
        <StatCard title="Available Copies" value={stats?.availableCopies} icon={Bookmark} color="text-success" delay={0.5} />
        <StatCard title="Issued Copies" value={stats?.issuedCopies} icon={BookCopy} color="text-warning" delay={0.6} />
        <StatCard title="Outstanding Fines" value={stats?.outstandingFines} icon={DollarSign} color="text-pink-500" delay={0.7} />
        <StatCard title="Total Publishers" value={stats?.totalPublishers} icon={Building} color="text-teal-400" delay={0.8} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="glass-panel rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Loans</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-textMuted uppercase border-b border-white/10">
                <tr><th className="pb-3">Loan ID</th><th className="pb-3">Issue Date</th><th className="pb-3 text-right">Status</th></tr>
              </thead>
              <tbody>
                {recentLoans.map(l => (
                  <tr key={l.LOANID} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="py-4 text-white font-medium">#{l.LOANID}</td>
                    <td className="py-4 text-textMuted">{new Date(l.ISSUEDATE).toLocaleDateString()}</td>
                    <td className="py-4 text-right">
                      <span className={\`px-3 py-1 rounded-full text-xs font-medium \${l.STATUS === 'Active' ? 'bg-electric/20 text-electric border border-electric/30' : l.STATUS === 'Overdue' ? 'bg-danger/20 text-danger border border-danger/30' : 'bg-white/10 text-textMuted border border-white/20'}\`}>
                        {l.STATUS}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="glass-panel rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recently Added Books</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-textMuted uppercase border-b border-white/10">
                <tr><th className="pb-3">Book</th><th className="pb-3 text-right">ISBN</th></tr>
              </thead>
              <tbody>
                {recentBooks.map(b => (
                  <tr key={b.BOOKID} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-10 bg-gradient-to-br from-electric/40 to-violet/40 rounded flex items-center justify-center text-xs font-bold text-white border border-white/10">
                          {b.TITLE.substring(0,2).toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{b.TITLE}</span>
                      </div>
                    </td>
                    <td className="py-3 text-textMuted text-right">{b.ISBN}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
`);
