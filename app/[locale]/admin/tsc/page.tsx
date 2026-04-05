"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  GraduationCap, Plus, Trash2, FileText, Download, 
  Search, RefreshCw, AlertCircle, CheckCircle2, X,
  Clock, FileType, HardDrive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminSidebar } from '../_components/AdminSidebar';
import { AdminHeader } from '../_components/AdminHeader';

interface TscResource {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  fileType: string;
  size: number | null;
  fileUrl: string | null;
  createdAt: string;
}

export default function TscAdminPage() {
  const [resources, setResources] = useState<TscResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    file: null as File | null,
    fileUrl: '',
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/tsc');
      if (res.ok) {
        setResources(await res.json());
      }
    } catch (e) {
      console.error('Failed to fetch TSC resources:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileName = file.name.split('.').slice(0, -1).join('.') || file.name;
      setForm(prev => ({ 
        ...prev, 
        file,
        title: prev.title || fileName.toUpperCase()
      }));
    }
  };

  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      let fileContent = null;
      let fileName = '';
      let fileType = '';
      let fileSize = 0;

      if (form.file) {
        fileContent = await toBase64(form.file);
        fileName = form.file.name;
        fileType = form.file.type;
        fileSize = form.file.size;
      }

      const res = await fetch('/api/admin/tsc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          fileContent,
          fileUrl: form.fileUrl,
          fileName: fileName || 'External Link',
          fileType: fileType || 'link',
          size: fileSize,
        }),
      });

      if (res.ok) {
        setSuccess('Resource deployed successfully!');
        setForm({ title: '', description: '', file: null, fileUrl: '' });
        setIsAdding(false);
        fetchResources();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to deploy resource');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Network error during deployment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanent deletion. Are you sure?')) return;
    
    try {
      const res = await fetch(`/api/admin/tsc?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setResources(prev => prev.filter(r => r.id !== id));
      }
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const filteredResources = resources.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-[var(--color-brand-red)]/30">
      <AdminSidebar />

      <main className="lg:pl-72 min-h-screen relative z-10 transition-all duration-500 pb-20">
        <AdminHeader 
          title="TSC Cloud Manager" 
          subtitle="Teachers Service Commission Resource Vault"
          onRefresh={fetchResources}
        />

        <div className="px-6 lg:px-10 py-10 max-w-[1600px] mx-auto">
          {/* Action Bar */}
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[var(--color-brand-red)] transition-colors" />
              <input 
                type="text" 
                placeholder="Query Registry..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold focus:outline-none focus:border-[var(--color-brand-red)]/30 transition-all placeholder:text-gray-700"
              />
            </div>
            
            <button 
              onClick={() => setIsAdding(true)}
              className="w-full md:w-auto px-8 py-4 bg-[var(--color-brand-red)] hover:bg-white text-white hover:text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-500/10 transition-all flex items-center justify-center gap-3 active:scale-95 italic"
            >
              <Plus className="w-4 h-4" />
              Manifest New Resource
            </button>
          </div>

          {loading ? (
             <div className="flex flex-col items-center justify-center min-h-[40vh] gap-6">
                <RefreshCw className="w-12 h-12 text-[var(--color-brand-red)] animate-spin opacity-20" />
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em]">Synchronizing Vault...</p>
             </div>
          ) : filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredResources.map((res) => (
                <motion.div 
                  layout
                  key={res.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 rounded-[40px] bg-[#0f0f0f] border border-white/5 hover:border-[var(--color-brand-red)]/20 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                    <FileText className="w-24 h-24 text-white" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[var(--color-brand-red)]">
                          <FileType className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest tabular-nums">
                          {res.fileType.split('/')[1]?.toUpperCase() || 'LINK'}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleDelete(res.id)}
                        className="p-3 text-gray-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-90"
                      >
                       <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-2 group-hover:text-[var(--color-brand-red)] transition-colors">
                      {res.title}
                    </h3>
                    <p className="text-sm font-medium text-gray-500 mb-8 line-clamp-2 leading-relaxed">
                      {res.description || 'No additional protocols defined for this node.'}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                        <p className="text-[8px] font-black text-gray-700 uppercase tracking-[0.2em] mb-1">Payload Size</p>
                        <p className="text-xs font-black text-white tabular-nums tracking-widest">
                          {res.size ? `${(res.size / 1024).toFixed(1)} KB` : 'N/A'}
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                        <p className="text-[8px] font-black text-gray-700 uppercase tracking-[0.2em] mb-1">Deployed</p>
                        <p className="text-xs font-black text-white tabular-nums tracking-widest">
                          {new Date(res.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                       <span className="text-[10px] font-black text-gray-800 uppercase tracking-tighter">ID: {res.id.slice(-8)}</span>
                       <div className="flex items-center gap-2 text-[var(--color-brand-red)] group-hover:translate-x-1 transition-transform">
                          <span className="text-[10px] font-black uppercase tracking-widest italic">Live Node</span>
                          <CheckCircle2 className="w-3 h-3" />
                       </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center bg-white/[0.02] rounded-[60px] border border-dashed border-white/10">
               <GraduationCap className="w-16 h-16 text-gray-800 mx-auto mb-6 opacity-20" />
               <p className="text-gray-600 font-black uppercase tracking-[0.5em] text-xs">Registry Empty</p>
               <button 
                 onClick={() => setIsAdding(true)}
                 className="mt-8 text-[var(--color-brand-red)] hover:text-white transition-colors font-black text-[10px] uppercase tracking-widest italic"
               >
                 Initialize First Protocol
               </button>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsAdding(false)} 
              className="absolute inset-0 bg-black/90 backdrop-blur-3xl" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="relative w-full max-w-2xl p-12 rounded-[60px] bg-[#0a0a0a] border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--color-brand-red)] to-[var(--color-brand-yellow)]" />
              
              <div className="flex items-center justify-between mb-12">
                <div>
                   <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Manifest.</h2>
                   <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mt-3 italic">Resource Deployment Interface</p>
                </div>
                <button onClick={() => setIsAdding(false)} className="p-4 bg-white/5 hover:bg-white/10 rounded-full transition-all">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-4 italic">Resource Designation</label>
                  <input 
                    type="text" 
                    required
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. TSC PAYROLL PROTOCOL 2026"
                    className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-[28px] text-sm font-bold focus:outline-none focus:border-[var(--color-brand-red)] transition-all placeholder:text-gray-800"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-4 italic">Data Description</label>
                  <textarea 
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Describe the utility of this node..."
                    className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-[32px] text-sm font-bold focus:outline-none focus:border-[var(--color-brand-red)] transition-all placeholder:text-gray-800 min-h-[140px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-4 italic">Physical Payload</label>
                    <div className="relative">
                      <input 
                        type="file" 
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full px-8 py-5 bg-white/5 border border-dashed border-white/10 rounded-[28px] text-xs font-black text-gray-600 uppercase tracking-widest flex items-center gap-3 transition-colors group-hover:border-white/20">
                         <Download className="w-4 h-4" />
                         {form.file ? form.file.name : 'Select PDF/DOCX'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-4 italic">External Link (Optional)</label>
                    <div className="relative">
                       <HardDrive className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
                       <input 
                        type="url" 
                        value={form.fileUrl}
                        onChange={e => setForm(p => ({ ...p, fileUrl: e.target.value }))}
                        placeholder="HTTPS://DRIVE..."
                        className="w-full pl-14 pr-8 py-5 bg-white/5 border border-white/10 rounded-[28px] text-sm font-bold focus:outline-none focus:border-[var(--color-brand-red)] transition-all placeholder:text-gray-800"
                      />
                    </div>
                  </div>
                </div>

                {(error || success) && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-6 rounded-[28px] flex items-center gap-4 ${error ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}
                  >
                    {error ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
                    <p className="text-[11px] font-black uppercase tracking-widest leading-relaxed">
                      {error || success}
                    </p>
                  </motion.div>
                )}

                <div className="pt-6">
                   <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full py-6 bg-[var(--color-brand-red)] hover:bg-white text-white hover:text-black rounded-[32px] font-black text-sm uppercase tracking-[0.4em] transition-all shadow-2xl shadow-red-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none italic"
                  >
                    {submitting ? 'COMMITTING DATA...' : 'INITIALIZE DEPLOYMENT'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
