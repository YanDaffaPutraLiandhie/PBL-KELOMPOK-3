import React, { useState } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import ActivityDetail from '@/components/ActivityDetail';

export default function LogAktivitas() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <>
      <Head>
        <title>Log Aktivitas - Smart Irrigation System</title>
        <meta name="description" content="Riwayat lengkap semua aktivitas sistem irigasi" />
      </Head>
      <div className={theme} suppressHydrationWarning>
        <div
          className="min-h-screen transition-all duration-300"
          style={{ background: 'var(--bg-900)' }}
          suppressHydrationWarning
        >
          <Header theme={theme} onToggleTheme={toggleTheme} isOnline={true} />

          <main className="px-4 pb-8 pt-2 max-w-7xl mx-auto" suppressHydrationWarning>
            <ActivityDetail />
          </main>
        </div>
      </div>
    </>
  );
}