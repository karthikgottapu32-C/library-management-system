const fs = require('fs');
let content = fs.readFileSync('frontend/src/components/tables/CrudPage.jsx', 'utf8');

// 1. Add View Modal State and Icon
content = content.replace(
  'const [modalOpen, setModalOpen] = useState(false);',
  'const [modalOpen, setModalOpen] = useState(false);\n  const [viewModalOpen, setViewModalOpen] = useState(false);\n  const [viewingItem, setViewingItem] = useState(null);\n  const [viewDetails, setViewDetails] = useState(null);'
);

content = content.replace(
  'import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, X, RefreshCw } from \'lucide-react\';',
  'import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, X, RefreshCw, Eye } from \'lucide-react\';'
);

// 2. Add View button to actions
const actionButtons = `
                      <button
                        onClick={() => {
                          setViewingItem(item);
                          setViewModalOpen(true);
                          // Fetch extra details if needed, e.g. for books
                          if (schema.endpoint === 'books') {
                            api.get(\`/book-copies?BOOKID=\${item.BOOKID}\`).then(res => {
                              setViewDetails(res.data.data);
                            });
                          }
                        }}
                        className="p-1.5 rounded-lg text-indigo-400 hover:bg-indigo-500/10 transition-colors interactive"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button`;
content = content.replace('<button', actionButtons);

// 3. Add View Modal HTML
const viewModalHtml = `
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
`;

content = content.replace('{/* Modal */}', viewModalHtml + '\n      {/* Modal */}');

fs.writeFileSync('frontend/src/components/tables/CrudPage.jsx', content);
