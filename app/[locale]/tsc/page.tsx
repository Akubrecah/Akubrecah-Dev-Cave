"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Download, Search, FileText, 
  ExternalLink, Clock, HardDrive, ShieldCheck,
  ArrowRight, Sparkles, AlertCircle, RefreshCw, X
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface TscResource {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  fileType: string;
  size: number | null;
  fileUrl: string | null;
  fileContent?: string | null;
  createdAt: string;
}

export default function TscPublicPage() {
  const params = useParams();
  const locale = params.locale as string;
  
  const [resources, setResources] = useState<TscResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tsc/resources');
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

  const handleDownload = async (resource: TscResource) => {
    if (resource.fileUrl && !resource.fileName.includes('.')) {
      // It's likely just an external link
      window.open(resource.fileUrl, '_blank');
      return;
    }

    try {
      setDownloadingId(resource.id);
      const res = await fetch(`/api/tsc/resources/${resource.id}`);
      if (!res.ok) throw new Error('Download failed');
      
      const data = await res.json();
      if (!data.fileContent && data.fileUrl) {
        window.open(data.fileUrl, '_blank');
        return;
      }

      if (data.fileContent) {
        const link = document.createElement('a');
        link.href = data.fileContent;
        link.download = data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to initialize download protocol. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredResources = resources.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-32 pb-20 px-4 sm:px-6 font-sans relative overflow-hidden bg-black text-white">
      {/* Background Ambience */}
      <div className="absolute top-[-200px] right-[-100px] w-[800px] h-[800px] pointer-events-none z-0" 
           style={{ background: 'radial-gradient(circle at center, rgba(31, 111, 91, 0.15) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-200px] left-[-100px] w-[600px] h-[600px] pointer-events-none z-0" 
           style={{ background: 'radial-gradient(circle at center, rgba(227, 6, 19, 0.1) 0%, transparent 70%)' }} />
      
      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 shadow-sm backdrop-blur-md text-white/90">
            <Sparkles className="h-4 w-4 text-[#2E8B75]" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#BEA0A0]">TSC Knowledge Hub</span>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-white leading-tight mb-8 tracking-tight italic">
            Teacher
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-[#1F6F5B] to-[#F5C200] ml-4 not-italic">
              Portal.
            </span>
          </h1>
          <p className="text-xl text-white/40 max-w-[650px] mx-auto leading-relaxed font-medium">
            Access, download, and manage Teachers Service Commission essential documents and digital resources in one secure location.
          </p>

          <div className="mt-12 max-w-2xl mx-auto relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1F6F5B]/20 to-[#F5C200]/20 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative flex items-center bg-[#1a1a1a] border border-white/10 rounded-[2rem] p-2 focus-within:border-[#1F6F5B]/50 transition-all shadow-2xl">
              <Search className="ml-6 w-5 h-5 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search resources, titles, or tags..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none focus:ring-0 px-6 py-4 text-white font-medium placeholder:text-gray-700"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-2 mr-2 hover:bg-white/5 rounded-full text-gray-500">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="relative">
              <div className="w-20 h-20 border-2 border-white/5 rounded-full animate-spin border-t-[#F5C200]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-[#1F6F5B]" />
              </div>
            </div>
            <p className="text-xs font-black text-gray-600 uppercase tracking-[0.6em]">Querying Node Registry...</p>
          </div>
        ) : filteredResources.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 sm:px-0"
          >
            {filteredResources.map((res) => (
              <motion.div 
                key={res.id}
                variants={itemVariants}
                className="glass-panel p-8 sm:p-10 border-white/10 hover:border-[#1F6F5B]/30 transition-all duration-500 group rounded-[2.5rem] bg-[#0a0a0a] shadow-2xl relative overflow-hidden flex flex-col h-full"
              >
                <div className="absolute -left-10 -top-10 w-40 h-40 bg-[#1F6F5B]/5 blur-3xl rounded-full group-hover:bg-[#1F6F5B]/10 transition-colors" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1F6F5B]/10 text-[#1F6F5B] group-hover:scale-110 transition-transform duration-500 shadow-sm border border-[#1F6F5B]/20">
                      <FileText className="h-8 w-8" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest tabular-nums italic">
                         {new Date(res.createdAt).getFullYear()} Node
                       </span>
                       <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Verified</span>
                       </div>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 tracking-tighter leading-tight italic group-hover:text-[#F5C200] transition-colors">{res.title}</h2>
                    <p className="text-white/40 text-sm leading-relaxed mb-10 font-medium line-clamp-3">
                      {res.description || 'Access essential TSC administrative documents and digital resource protocols for verified educators.'}
                    </p>
                  </div>

                  <div className="mt-auto space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Payload</span>
                          <div className="flex items-center gap-2 text-white/60 text-xs font-bold tabular-nums">
                             <HardDrive className="w-3 h-3 text-[#1F6F5B]" />
                             {res.size ? `${(res.size / 1024).toFixed(1)} KB` : 'LINK'}
                          </div>
                       </div>
                       <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Modified</span>
                          <div className="flex items-center gap-2 text-white/60 text-xs font-bold tabular-nums">
                             <Clock className="w-3 h-3 text-[#F5C200]" />
                             {new Date(res.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase()}
                          </div>
                       </div>
                    </div>

                    <button 
                      onClick={() => handleDownload(res)}
                      disabled={downloadingId === res.id}
                      className="inline-flex items-center justify-between w-full p-5 rounded-2xl bg-white/5 text-white font-black border border-white/10 group-hover:bg-[#1F6F5B] group-hover:border-[#1F6F5B] transition-all shadow-inner active:scale-95 disabled:opacity-50 italic uppercase text-xs tracking-widest"
                    >
                      <span>{downloadingId === res.id ? 'Decrypting...' : (res.fileContent ? 'Request Access' : 'External Node')}</span>
                      <div className="bg-white/10 p-2 rounded-xl group-hover:bg-black/20 transition-colors">
                        {res.fileContent ? <Download className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                      </div>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="py-40 text-center glass-panel rounded-[4rem] border-white/5">
             <AlertCircle className="w-20 h-20 text-[#1F6F5B] mx-auto mb-8 opacity-20" />
             <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4">No results found.</h3>
             <p className="text-white/40 max-w-sm mx-auto font-medium">Try refining your search query or check back later for new TSC resource updates.</p>
             <button 
               onClick={() => setSearchQuery('')}
               className="mt-10 px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all border border-white/10"
             >
               Clear Connectivity
             </button>
          </div>
        )}

        {/* Support Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-32 p-12 sm:p-20 rounded-[4rem] bg-gradient-to-br from-[#0a0a0a] to-[#121212] border border-white/5 relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 p-20 opacity-[0.03] rotate-12">
              <GraduationCap className="w-64 h-64 text-white" />
           </div>
           
           <div className="relative z-10 max-w-3xl">
              <h2 className="text-3xl sm:text-5xl font-black text-white italic tracking-tighter uppercase mb-8 leading-tight">Need specific TSC <span className="text-[#1F6F5B] not-italic">Assistance?</span></h2>
              <p className="text-white/40 text-lg sm:text-xl font-medium leading-relaxed mb-12">
                Our team provides dedicated support for TSC document retrieval, pay-slip issues, and administrative compliance.
              </p>
              <div className="flex flex-wrap gap-4">
                 <Button className="bg-[#1F6F5B] hover:bg-[#145A47] text-white px-10 py-7 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] italic shadow-2xl shadow-[#1F6F5B]/20">
                   Contact Consultant
                 </Button>
                 <Button variant="ghost" className="text-white/80 hover:text-white px-10 py-7 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] italic border border-white/10">
                   Compliance Guide
                 </Button>
              </div>
           </div>
        </motion.div>
      </div>
    </div>
  );
}
