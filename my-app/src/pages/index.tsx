import { useState, useEffect } from "react";
import Head from "next/head";
import Header from "@/components/Header";
import SensorCards from "@/components/SensorCards";
import ChartSection from "@/components/ChartSection";
import IrrigationTracking from "@/components/IrrigationTracking";
import ActivityLog from "@/components/ActivityLog";
import WaterAvailability from "@/components/WaterAvailability";
import IrrigationModes from "@/components/IrrigationModes";
import { generateSensorData, generateIrrigationEvents } from "@/lib/mockData";
import type { IrrigationEvent } from "@/lib/mockData";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
export default function Dashboard() {
  const { data: session, status }: any = useSession();
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [sensorData, setSensorData] = useState({ soilMoisture: 0, temperature: 0, pumpStatus: "NON-AKTIF" });
  const [logs, setLogs] = useState<{ time: string; message: string; type: string }[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [irrigationEvents, setIrrigationEvents] = useState<IrrigationEvent[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // State untuk threshold konfigurasi
  const [threshold, setThreshold] = useState<any>(null);
  const [thresholdLoading, setThresholdLoading] = useState(true);

  // Ambil threshold dari API saat halaman dimount
  useEffect(() => {
    const fetchThreshold = async () => {
      try {
        const res = await fetch("/api/config");
        if (res.ok) {
          const data = await res.json();
          setThreshold(data);
        }
      } catch (err) {
        // Optional: handle error
      } finally {
        setThresholdLoading(false);
      }
    };
    fetchThreshold();
  }, []);

  // Contoh logika: warning jika soilMoisture < min atau > max
  const showMoistureWarning = threshold && sensorData && (sensorData.soilMoisture < threshold.soilMoistureMin || sensorData.soilMoisture > threshold.soilMoistureMax);
  const showTempWarning = threshold && sensorData && (sensorData.temperature < threshold.temperatureMin || sensorData.temperature > threshold.temperatureMax);
  const showAlert = threshold && sensorData && (sensorData.soilMoisture > threshold.alertThreshold);
  // ...existing code...

  // Initialize data after hydration and setup real-time updates (only for sensor values, not pump status)
  useEffect(() => {
    setIsHydrated(true);
    setSensorData(generateSensorData());
    setIrrigationEvents(generateIrrigationEvents());

    // Only update sensor values (soilMoisture and temperature), not pump status
    const interval = setInterval(() => {
      setSensorData((prev) => ({
        ...prev,
        soilMoisture: 48 + Math.floor(Math.random() * 6 - 3),
        temperature: 25 + parseFloat((Math.random() * 2 - 1).toFixed(1)),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handlePumpToggle = (state: boolean) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const message = state ? "Pompa dihidupkan (AKTIF)" : "Pompa dimatikan (NON-AKTIF)";
    const newLog = { time: timeStr, message, type: "pump" };
    setLogs((prev) => [newLog, ...prev].slice(0, 20));

    // Update sensor data to reflect pump status change
    setSensorData((prev) => ({
      ...prev,
      pumpStatus: state ? "AKTIF" : "NON-AKTIF",
    }));

    // Add new irrigation event if pump is turned on
    if (state) {
      const newEvent: IrrigationEvent = {
        timestamp: new Date(),
        duration: 5,
        type: "quick",
      };
      setIrrigationEvents((prev) => [...prev, newEvent]);
    }
  };

  const handleQuickAction = (action: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const newLog = { time: timeStr, message: action, type: "action" };
    setLogs((prev) => [newLog, ...prev].slice(0, 20));

    // Add new irrigation event when irrigation mode is triggered
    const eventType = action.includes("cepat")
      ? "quick"
      : action.includes("intensif")
        ? "intensive"
        : "water-saving";
    const newEvent: IrrigationEvent = {
      timestamp: new Date(),
      duration: action.includes("intensif") ? 10 : action.includes("hemat") ? 20 : 5,
      type: eventType as "quick" | "intensive" | "water-saving",
    };
    setIrrigationEvents((prev) => [...prev, newEvent]);
  };
  // --- Proteksi Login ---
  // Jika belum login, redirect langsung ke halaman login
  useEffect(() => {
    if (status !== "loading" && !session) {
      router.replace("/auth/login");
    }
  }, [status, session, router]);

  // Tampilkan loader singkat saat status masih loading atau saat melakukan redirect
  if (status === "loading" || !session) {
    return (
      <div style={{ padding: '5rem 2rem', textAlign: 'center', background: 'var(--bg-900)', minHeight: '100vh' }}>
        <h1 className="glow-text">Redirecting...</h1>
      </div>
    );
  }
  return (
    <>
      <Head>
        <title>Smart Irrigation System</title>
        <meta name="description" content="Dashboard monitoring sistem irigasi cerdas" />
      </Head>
      <div className={theme} suppressHydrationWarning>
        <div
          className="min-h-screen transition-all duration-300"
          style={{ background: "var(--bg-900)" }}
          suppressHydrationWarning
        >
          <Header theme={theme} onToggleTheme={toggleTheme} isOnline={isOnline} />

          <main className="px-4 pb-8 pt-2 max-w-7xl mx-auto" suppressHydrationWarning>
            {/* Tampilkan threshold info dan warning jika ada */}
            {!thresholdLoading && threshold && (
              <div className="mb-4">
                <div className="text-xs text-[var(--primary)]">Konfigurasi Threshold saat ini:</div>
                <div className="flex flex-wrap gap-4 text-xs">
                  <span>Kelembapan Min: <b>{threshold.soilMoistureMin}</b></span>
                  <span>Kelembapan Max: <b>{threshold.soilMoistureMax}</b></span>
                  <span>Suhu Min: <b>{threshold.temperatureMin}°C</b></span>
                  <span>Suhu Max: <b>{threshold.temperatureMax}°C</b></span>
                  <span>Alert: <b>{threshold.alertThreshold}</b></span>
                </div>
                {showMoistureWarning && (
                  <div className="mt-2 p-2 rounded bg-yellow-900/60 text-yellow-300 border border-yellow-400 text-xs font-semibold">
                    Kelembapan tanah di luar batas threshold!
                  </div>
                )}
                {showTempWarning && (
                  <div className="mt-2 p-2 rounded bg-orange-900/60 text-orange-300 border border-orange-400 text-xs font-semibold">
                    Suhu lingkungan di luar batas threshold!
                  </div>
                )}
                {showAlert && (
                  <div className="mt-2 p-2 rounded bg-pink-900/60 text-pink-300 border border-pink-400 text-xs font-semibold">
                    ALERT: Kelembapan tanah melebihi ambang batas alert!
                  </div>
                )}
              </div>
            )}
            {/* Sensor Cards Row */}
            {isHydrated && <SensorCards data={sensorData} onPumpToggle={handlePumpToggle} />}

            {/* Charts Row */}
            {isHydrated && <ChartSection />}

            {/* Stats + Log Row */}
            {isHydrated && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <IrrigationTracking irrigationData={irrigationEvents} />
              <ActivityLog logs={logs} />
            </div>
            )}

            {/* Water Availability */}
            {isHydrated && <WaterAvailability percentage={90} />}

            {/* Irrigation Modes */}
            {isHydrated && (
            <IrrigationModes 
              onAction={handleQuickAction} 
              isPumpActive={sensorData.pumpStatus === "AKTIF"}
            />
            )}
          </main>
        </div>
      </div>
    </>
  );
}

