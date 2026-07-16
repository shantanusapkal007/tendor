'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UnauthorizedPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
      } else {
        router.push('/login');
        router.refresh();
      }
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafc] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-red-100 to-orange-100 blur-3xl opacity-50" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-[32px] p-10 flex flex-col items-center">
          
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shadow-sm mb-6">
            <ShieldAlert size={32} />
          </div>

          <h1 className="text-[28px] font-bold tracking-tight text-[#111] mb-2 text-center">
            Access Denied
          </h1>
          <p className="text-[#555] text-center mb-8 text-[15px]">
            Your email address has not been authorized to access this dashboard. Please contact an administrator.
          </p>

          <button
            onClick={handleSignOut}
            className="w-full relative group overflow-hidden bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-semibold py-3.5 px-6 rounded-2xl shadow-sm transition-all duration-300 flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-[15px]">Sign out and try another account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
