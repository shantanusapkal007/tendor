import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const viewport = {
  themeColor: '#0066cc',
};

export const metadata: Metadata = {
  title: 'QuoteMate',
  description: 'Fast, minimal quotation generator.',
  manifest: '/manifest.json',
};

import { Toaster } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

import { createClient } from '@/lib/supabase/server';
import Header from './components/Header';

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const { data: settings } = await supabase.from('Settings').select('companyName').maybeSingle();
  const titleText = settings?.companyName ? `${settings.companyName} quotation` : 'QuoteMate';

  const serverSupabase = await createClient();
  const { data: { user } } = await serverSupabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data: appUser } = await supabase.from('AppUser').select('role').eq('email', user.email).maybeSingle();
    isAdmin = appUser?.role === 'admin';
  }

  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="bg-slate-50 text-slate-900 font-sans antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <Toaster position="bottom-right" toastOptions={{ className: 'text-sm font-medium' }} />
        <Header titleText={titleText} isAdmin={isAdmin} />
        
        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
