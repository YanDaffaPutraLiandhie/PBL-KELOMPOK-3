import React, { useState } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import WeeklyChart from '@/components/WeeklyChart';

export default function HistoriKelembapan() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <>
      <Head>
        <title>Riwayat Kelembapan - Smart Irrigation System</title>
      </Head>
      <div className={theme} suppressHydrationWarning>
        <div
          className="min-h-screen transition-all duration-300"
          style={{ background: 'var(--bg-900)' }}
          suppressHydrationWarning
        >
          <Header theme={theme} onToggleTheme={toggleTheme} isOnline={true} />

          <main className="px-4 pb-8 pt-2 max-w-7xl mx-auto" suppressHydrationWarning>
            <WeeklyChart
              title="Data Kelembapan Tanah - 7 Hari Terakhir"
              dataKey="kelembaban"
              unit="%"
              color="#3b82f6"
            />
          </main>
        </div>
      </div>
    </>
  );
}
