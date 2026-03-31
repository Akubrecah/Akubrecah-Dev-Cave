"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort('Verification timed out after 30s'), 30000); 

      try {
        const res = await fetch('/api/admin/stats', { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (res.status === 403 || res.status === 401) {
          setIsAdmin(false);
          return;
        }
        
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        
        setIsAdmin(true);
      } catch (err: any) {
        clearTimeout(timeoutId);
        console.error('Admin check error:', err);
        
        // Don't immediately redirect if it's a connection/timeout error
        // Let them see the state or retry
        if (err.name === 'AbortError') {
           setAdminError('Database connection timed out. Please check your internet or DATABASE_URL.');
        } else {
           setAdminError(err.message || 'An unexpected error occurred during verification.');
        }
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [router]);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center space-y-4 p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 max-w-md mx-4">
          <Shield className="w-16 h-16 text-red-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Access Denied</h2>
          <p className="text-gray-400">
            {adminError || "You don't have admin privileges."}
          </p>
          <div className="flex flex-col gap-2 pt-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors text-sm"
            >
              Retry Verification
            </button>
            <button 
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-red-400 rounded-xl transition-colors text-sm"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-gray-950 overflow-auto custom-scrollbar">
      {children}
    </div>
  );
}
