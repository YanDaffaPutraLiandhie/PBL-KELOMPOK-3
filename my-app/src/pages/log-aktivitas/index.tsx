import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import ActivityDetail from '@/components/ActivityDetail';
import { getLogs } from '@/utils/db/servicefirebase';

export default function LogAktivitas() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const fetchedLogs = await getLogs(200); // Ambil 200 log terbaru
        setLogs(fetchedLogs);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

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
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <p style={{ color: 'var(--text-primary)' }}>Memuat log aktivitas...</p>
              </div>
            ) : (
              <ActivityDetail logs={logs} />
            )}
          </main>
        </div>
      </div>
    </>
  );
}