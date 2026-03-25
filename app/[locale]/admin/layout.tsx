"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.status === 403 || res.status === 401) {
          setIsAdmin(false);
          setTimeout(() => router.push('/'), 2000);
          return;
        }
        setIsAdmin(true);
      } catch {
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
        <div className="text-center space-y-4 p-8 rounded-2xl bg-red-500/10 border border-red-500/20">
          <Shield className="w-16 h-16 text-red-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Access Denied</h2>
          <p className="text-gray-400">You don&apos;t have admin privileges.</p>
          <p className="text-gray-500 text-sm">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
