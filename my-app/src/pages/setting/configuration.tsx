
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { Sliders, Droplets, Thermometer, AlertTriangle, ArrowLeft } from "lucide-react";
import InputField from "../../components/InputField";
import Header from "../../components/Header";
import { defaultConfig, validateConfig } from "../../lib/configUtils";

const ConfigurationPage = () => {
  // State
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isOnline] = useState(true);
  const [config, setConfig] = useState(defaultConfig);
  const [notif, setNotif] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Theme toggle
  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  // Ambil konfigurasi dari API saat halaman dibuka
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/config");
        if (res.ok) {
          const data = await res.json();
          setConfig(data ?? defaultConfig);
        } else {
          setConfig(defaultConfig);
        }
      } catch {
        setNotif({ type: 'error', message: 'Gagal mengambil konfigurasi dari server.' });
        setConfig(defaultConfig);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: Number(value) }));
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateConfig(config, setNotif)) return;
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setNotif({ type: 'success', message: 'Konfigurasi berhasil disimpan!' });
      } else {
        setNotif({ type: 'error', message: 'Gagal menyimpan konfigurasi ke server.' });
      }
    } catch {
      setNotif({ type: 'error', message: 'Gagal menyimpan konfigurasi ke server.' });
    }
  };

  // Handle reset
  const handleReset = async () => {
    setConfig(defaultConfig);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(defaultConfig),
      });
      if (res.ok) {
        setNotif({ type: 'success', message: 'Konfigurasi dikembalikan ke default.' });
      } else {
        setNotif({ type: 'error', message: 'Gagal reset konfigurasi ke server.' });
      }
    } catch {
      setNotif({ type: 'error', message: 'Gagal reset konfigurasi ke server.' });
    }
  };

  return (
    <>
      <Head>
        <title>Konfigurasi Threshold - Smart Irrigation</title>
        <meta name="description" content="Pengaturan threshold irigasi cerdas" />
      </Head>
      <div className={theme}>
        <div className="min-h-screen transition-all duration-300" style={{ background: "var(--bg-900)" }}>
          <Header theme={theme} onToggleTheme={toggleTheme} isOnline={isOnline} />
          <main className="flex flex-col items-center justify-center min-h-[80vh] px-2 pt-6 md:pt-10">
            <div
              className={`w-full max-w-2xl md:max-w-3xl rounded-2xl shadow-2xl p-4 md:p-8 border transition-colors duration-300
                ${theme === "dark"
                  ? "bg-[var(--card-bg)] border-[var(--border)]"
                  : "bg-white border-gray-300"
                }
              `}
            >
              {loading && (
                <div className="text-center text-sm text-[var(--text-muted)] mb-4">Memuat konfigurasi dari server...</div>
              )}
              {/* Tombol Kembali */}
              <div className="mb-6">
                <Link href="/" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-600)] border border-[var(--border)] text-sm text-[var(--primary)] font-semibold shadow hover:scale-105 transition-all">
                  <ArrowLeft className="w-5 h-5" /> Dashboard
                </Link>
              </div>
              {/* Judul dan Icon */}
              <div className="flex items-center gap-3 mb-6 mt-2">
                <Sliders className="w-7 h-7 text-[var(--primary)]" />
                <h2 className="text-2xl font-extrabold text-[var(--primary)] tracking-wide">Konfigurasi Threshold</h2>
              </div>
              {/* Notifikasi */}
              {notif && (
                <div className={`mb-4 px-4 py-2 rounded-lg text-sm font-semibold ${
                  notif.type === 'success'
                    ? 'bg-green-900/60 text-green-300 border border-green-400'
                    : 'bg-red-900/60 text-red-300 border border-red-400'
                }`}>
                  {notif.message}
                </div>
              )}
              {/* Form konfigurasi */}
              <form onSubmit={handleSubmit} className="space-y-5 mt-2">
                <div className="flex flex-col md:flex-row gap-4 md:gap-5">
                  <InputField
                    label="Kelembapan Tanah Minimum (%)"
                    name="soilMoistureMin"
                    value={config.soilMoistureMin}
                    onChange={handleChange}
                    icon={<Droplets className={`w-6 h-6 ${theme === "dark" ? "text-cyan-300" : "text-cyan-700"}`} />}
                    colorClass={theme === "dark" ? "text-cyan-300" : "text-cyan-700"}
                    className={theme === "dark" ? "bg-[var(--card-bg)] border-[var(--border)]" : "bg-white border-gray-300"}
                    info="Nilai minimum kelembapan tanah agar irigasi aktif."
                    description="Irigasi akan aktif jika kelembapan di bawah nilai ini."
                    min={0}
                    max={100}
                  />
                  <InputField
                    label="Kelembapan Tanah Maksimum (%)"
                    name="soilMoistureMax"
                    value={config.soilMoistureMax}
                    onChange={handleChange}
                    icon={<Droplets className={`w-6 h-6 ${theme === "dark" ? "text-cyan-300" : "text-cyan-700"}`} />}
                    colorClass={theme === "dark" ? "text-cyan-300" : "text-cyan-700"}
                    className={theme === "dark" ? "bg-[var(--card-bg)] border-[var(--border)]" : "bg-white border-gray-300"}
                    info="Nilai maksimum kelembapan tanah agar irigasi berhenti."
                    description="Irigasi akan berhenti jika kelembapan di atas nilai ini."
                    min={0}
                    max={100}
                  />
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-5">
                  <InputField
                    label="Suhu Minimum (°C)"
                    name="temperatureMin"
                    value={config.temperatureMin}
                    onChange={handleChange}
                    icon={<Thermometer className={`w-6 h-6 ${theme === "dark" ? "text-orange-300" : "text-orange-700"}`} />}
                    colorClass={theme === "dark" ? "text-orange-300" : "text-orange-700"}
                    className={theme === "dark" ? "bg-[var(--card-bg)] border-[var(--border)]" : "bg-white border-gray-300"}
                    info="Nilai suhu minimum yang diizinkan."
                    description="Sistem akan memberi peringatan jika suhu di bawah nilai ini."
                    min={-20}
                    max={100}
                  />
                  <InputField
                    label="Suhu Maksimum (°C)"
                    name="temperatureMax"
                    value={config.temperatureMax}
                    onChange={handleChange}
                    icon={<Thermometer className={`w-6 h-6 ${theme === "dark" ? "text-orange-300" : "text-orange-700"}`} />}
                    colorClass={theme === "dark" ? "text-orange-300" : "text-orange-700"}
                    className={theme === "dark" ? "bg-[var(--card-bg)] border-[var(--border)]" : "bg-white border-gray-300"}
                    info="Nilai suhu maksimum yang diizinkan."
                    description="Sistem akan memberi peringatan jika suhu di atas nilai ini."
                    min={-20}
                    max={100}
                  />
                </div>
                <InputField
                  label="Ambang Batas Alert (%)"
                  name="alertThreshold"
                  value={config.alertThreshold}
                  onChange={handleChange}
                  icon={<AlertTriangle className={`w-6 h-6 ${theme === "dark" ? "text-pink-300" : "text-pink-700"}`} />}
                  colorClass={theme === "dark" ? "text-pink-300" : "text-pink-700"}
                  className={theme === "dark" ? "bg-[var(--card-bg)] border-[var(--border)]" : "bg-white border-gray-300"}
                  info="Nilai deviasi maksimum sebelum sistem memberi peringatan."
                  description="Jika nilai melebihi ambang ini, sistem akan memberi alert."
                  min={0}
                  max={100}
                />
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 mt-4">
                  <button type="submit" className="w-full md:w-1/2 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-green-400 text-white font-bold text-base md:text-lg shadow hover:scale-[1.03] transition-all">Simpan Konfigurasi</button>
                  <button type="button" onClick={handleReset} className="w-full md:w-1/2 py-2 rounded-lg bg-gradient-to-r from-gray-600 to-gray-800 text-white font-bold text-base md:text-lg shadow hover:scale-[1.03] transition-all">Reset ke Default</button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default ConfigurationPage;
