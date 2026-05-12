import { useState, useEffect } from "react";
import Head from "next/head";
import Header from "@/components/Header";
import SensorCards from "@/components/SensorCards";
import ChartSection from "@/components/ChartSection";
import IrrigationTracking from "@/components/IrrigationTracking";
import ActivityLog from "@/components/ActivityLog";
import WaterAvailability from "@/components/WaterAvailability";
import IrrigationModes from "@/components/IrrigationModes";
import type { IrrigationEvent } from "@/lib/mockData";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { saveLog } from "@/utils/db/servicefirebase";

import { getFirestore, collection, query, orderBy, limit, where, onSnapshot, getDocs } from "firebase/firestore";
import app, { db as realtimeDb } from "@/utils/db/firebase";
import { ref, onValue, set, update } from "firebase/database";

const firestoreDb = getFirestore(app);

export default function Dashboard() {
  const { data: session, status }: any = useSession();
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [sensorData, setSensorData] = useState({
    soilMoisture: 0,
    temperature: 0,
    pumpStatus: "NON-AKTIF",
    waterLevel: 0,
    waterLevelLCM: 0,
  });
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



  // Initialize data after hydration and setup real-time updates
  useEffect(() => {
    setIsHydrated(true);

    // 1) Subscribe latest sensor snapshot (from Realtime Database)
    const smartPlantRef = ref(realtimeDb, 'SmartPlant');
    const unsubSensor = onValue(smartPlantRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensorData({
          soilMoisture: data.soilMoisture ?? 0,
          temperature: data.temperature ?? 0,
          pumpStatus: data.pumpStatus ? "AKTIF" : "NON-AKTIF",
          waterLevel: data.waterLevel ?? 0,
          waterLevelLCM: data.waterLevelCM ?? 0,
        });
      }
    });

    // 2) Subscribe latest logs (and derive irrigation events from logs)
    const logsQ = query(
      collection(firestoreDb, "logs"),
      orderBy("timestamp", "desc"),
      limit(200)
    );

    const unsubLogs = onSnapshot(logsQ, (snapshot) => {
      const mapped = snapshot.docs.map((doc) => {
        const d: any = doc.data();
        const ts: Date = d.timestamp?.toDate?.() ?? new Date(d.createdAt ?? Date.now());
        return {
          time: ts.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          message: d.message,
          type: d.type,
        };
      });
      setLogs(mapped);

      // Derive irrigation events from logs (type pump/action)
      const derived: IrrigationEvent[] = snapshot.docs
        .map((doc) => {
          const d: any = doc.data();
          const ts: Date = d.timestamp?.toDate?.() ?? new Date(d.createdAt ?? Date.now());
          const msg: string = String(d.message ?? "");
          const type: string = String(d.type ?? "");

          // Only convert relevant logs
          if (type !== "pump" && type !== "action") return null;

          // Pump on => quick (duration default)
          if (type === "pump") {
            if (msg.toLowerCase().includes("dihidupkan") || msg.toLowerCase().includes("aktif")) {
              return { timestamp: ts, duration: 5, type: "quick" } as IrrigationEvent;
            }
            return null;
          }

          // Action => map by keywords (cepat/intensif/hemat)
          const lower = msg.toLowerCase();
          if (lower.includes("cepat")) return { timestamp: ts, duration: 5, type: "quick" } as IrrigationEvent;
          if (lower.includes("intensif")) return { timestamp: ts, duration: 10, type: "intensive" } as IrrigationEvent;
          if (lower.includes("hemat")) return { timestamp: ts, duration: 20, type: "water-saving" } as IrrigationEvent;
          return null;
        })
        .filter(Boolean) as IrrigationEvent[];

      // sort asc so filtering by date works properly
      derived.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      setIrrigationEvents(derived);
    });

    return () => {
      unsubSensor();
      unsubLogs();
    };
  }, []);


  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handlePumpToggle = async (state: boolean) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const message = state ? "Pompa dihidupkan (AKTIF)" : "Pompa dimatikan (NON-AKTIF)";
    const newLog = { time: timeStr, message, type: "pump" };
    setLogs((prev) => [newLog, ...prev].slice(0, 20));

    // Simpan log ke Firebase
    await saveLog({ message, type: "pump", timestamp: now });

    // Update Realtime Database
    const smartPlantRef = ref(realtimeDb, 'SmartPlant');
    update(smartPlantRef, { pumpStatus: state });

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

  const handleQuickAction = async (action: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const newLog = { time: timeStr, message: action, type: "action" };
    setLogs((prev) => [newLog, ...prev].slice(0, 20));

    // Simpan log ke Firebase
    await saveLog({ message: action, type: "action", timestamp: now });

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
        <h1 className="glow-text">MEMUAT</h1>
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
              <SensorCards data={sensorData} onPumpToggle={handlePumpToggle} />


            {/* Charts Row */}
            {isHydrated && <ChartSection data={sensorData} />}

            {/* Stats + Log Row */}
            {isHydrated && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <IrrigationTracking irrigationData={irrigationEvents} />
              <ActivityLog logs={logs} />
            </div>
            )}

            {/* Water Availability */}
            {isHydrated && <WaterAvailability percentage={sensorData.waterLevel} />}

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

