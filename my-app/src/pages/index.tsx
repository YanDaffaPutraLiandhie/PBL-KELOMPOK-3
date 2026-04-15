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
export default function Dashboard() {
  const { data: session }: any = useSession();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [sensorData, setSensorData] = useState({ soilMoisture: 0, temperature: 0, pumpStatus: "NON-AKTIF" });
  const [logs, setLogs] = useState<{ time: string; message: string; type: string }[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [irrigationEvents, setIrrigationEvents] = useState<IrrigationEvent[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

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
  // Jika belum login, jangan tampilkan dashboard asli
  if (!session) {
    return (
      <div style={{ padding: '5rem 2rem', textAlign: 'center', background: 'var(--bg-900)', minHeight: '100vh' }}>
        <h1 className="glow-text">ACCESS DENIED</h1>
        <div className="card" style={{ marginTop: '2rem', display: 'inline-block', padding: '2rem' }}>
          <p className="log-entry" style={{ color: '#ef4444' }}>ERROR: AUTHENTICATION_REQUIRED</p>
          <p style={{ color: 'var(--text-primary)' }}>Silakan login untuk akses dashboard.</p>
        </div>
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

