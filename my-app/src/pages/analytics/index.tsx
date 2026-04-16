import Head from "next/head";
import { useState } from "react";
import Header from "@/components/Header";
import ChartKelembapan from "@/components/analytics/chartKelembapan";
import ChartSuhu from "@/components/analytics/chartSuhu";
import Link from "next/link";
import { ArrowLeft, Activity, Calendar } from "lucide-react";

// Import fungsi Firestore
import { getFirestore, collection, addDoc } from "firebase/firestore";
import app from "@/utils/db/firebase"; 

// Inisialisasi db
const db = getFirestore(app);

export default function Analitik() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isOnline] = useState(true);
  const [loadingType, setLoadingType] = useState<string | null>(null);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  /**
   * Fungsi Simulasi Data:
   * Mengirim 6 dokumen sekaligus ke Firestore dengan timestamp yang diatur mundur
   * untuk mengetes fitur tren (6 jam lalu atau 6 hari lalu).
   */
  const handleSimulateData = async (type: "current" | "history") => {
    setLoadingType(type);
    try {
      // Loop 6 kali untuk membuat 6 data poin sekaligus
      for (let i = 1; i <= 6; i++) {
        const randomMoisture = Math.floor(Math.random() * (85 - 30 + 1)) + 30;
        const randomTemp = (Math.random() * (34 - 24) + 24).toFixed(1);
        
        const targetDate = new Date();
        
        if (type === "history") {
          // Mundur i hari (untuk tren 7 hari)
          targetDate.setDate(targetDate.getDate() - i);
        } else {
          // Mundur i jam (untuk tren 24 jam)
          targetDate.setHours(targetDate.getHours() - i);
        }

        const newData = {
          soilMoisture: randomMoisture,
          temperature: Number(randomTemp),
          pumpStatus: Math.random() > 0.5 ? "AKTIF" : "MATI",
          timestamp: targetDate,
        };

        // Simpan ke Firestore
        await addDoc(collection(db, "sensorData"), newData);
      }
      
      console.log(`Berhasil mengirim 6 data simulasi untuk ${type}`);
    } catch (error) {
      console.error("Error saat simulasi data:", error);
      alert("Gagal mengirim data simulasi grup.");
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <>
      <Head>
        <title>Analitik - Smart Irrigation</title>
        <meta
          name="description"
          content="Analisis kelembapan tanah dan suhu real-time"
        />
      </Head>

      <div className={theme}>
        <div
          className="min-h-screen transition-all duration-300"
          style={{ background: "var(--bg-900)" }}
        >
          <Header
            theme={theme}
            onToggleTheme={toggleTheme}
            isOnline={isOnline}
          />

          <main className="px-4 pb-8 pt-4 max-w-7xl mx-auto text-white">
            {/* Header Analitik dengan Tombol Simulasi */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              
              {/* Sisi Kiri: Navigasi & Judul */}
              <div className="flex items-center gap-3">
                <Link href="/">
                  <button
                    className="p-2 rounded-lg transition-all hover:scale-110"
                    style={{
                      background: "var(--bg-800)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <ArrowLeft
                      className="w-4 h-4"
                      style={{ color: "var(--primary)" }}
                    />
                  </button>
                </Link>
                <h1 className="text-2xl font-bold">Analitik Sensor</h1>
              </div>

              {/* Sisi Kanan: Kontrol Simulasi */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleSimulateData("current")}
                  disabled={loadingType !== null}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    loadingType === "current" 
                      ? "bg-gray-600 cursor-not-allowed" 
                      : "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-lg shadow-blue-900/20"
                  }`}
                >
                  <Activity className={`w-3 h-3 ${loadingType === "current" ? "animate-pulse" : ""}`} />
                  {loadingType === "current" ? "Mengirim..." : "Simulasi 6 Jam"}
                </button>

                <button
                  onClick={() => handleSimulateData("history")}
                  disabled={loadingType !== null}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    loadingType === "history" 
                      ? "bg-gray-600 cursor-not-allowed" 
                      : "bg-purple-600 hover:bg-purple-700 active:scale-95 text-white shadow-lg shadow-purple-900/20"
                  }`}
                >
                  <Calendar className={`w-3 h-3 ${loadingType === "history" ? "animate-pulse" : ""}`} />
                  {loadingType === "history" ? "Mengirim..." : "Simulasi 6 Hari"}
                </button>
              </div>
            </div>

            {/* Grid Grafik */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartKelembapan />
              <ChartSuhu />
            </div>
            
            <p className="mt-6 text-xs text-center text-gray-500 italic">
              *Klik simulasi untuk mengetes kalkulasi tren secara otomatis pada grafik.
            </p>
          </main>
        </div>
      </div>
    </>
  );
}