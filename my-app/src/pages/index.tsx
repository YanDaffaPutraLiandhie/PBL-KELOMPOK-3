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

export default function Dashboard() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [sensorData, setSensorData] = useState({ soilMoisture: 0, temperature: 0, pumpStatus: "NON-AKTIF" });
  const [logs, setLogs] = useState<{ time: string; message: string; type: string }[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [irrigationEvents, setIrrigationEvents] = useState<IrrigationEvent[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);


  // Fetch data dari API dummy
  useEffect(() => {
    setIsHydrated(true);

    // Fetch sensor data
    fetch("/api/sensor/all")
      .then((res) => res.json())
      .then((data) => {
        const soil = data.find((d: any) => d.type === "soilMoisture");
        const temp = data.find((d: any) => d.type === "temperature");
        setSensorData((prev) => ({
          ...prev,
          soilMoisture: soil ? soil.value : 0,
          temperature: temp ? temp.value : 0,
        }));
      });

    // Fetch pump status
    fetch("/api/actuator/status")
      .then((res) => res.json())
      .then((data) => {
        setSensorData((prev) => ({
          ...prev,
          pumpStatus: data.status === "ON" ? "AKTIF" : "NON-AKTIF",
        }));
      });

    // Fetch irrigation events/statistics
    fetch("/api/statistics/irrigation")
      .then((res) => res.json())
      .then((data) => {
        // Contoh: data.today, data.week, data.month
        setIrrigationEvents([
          {
            timestamp: new Date(),
            duration: data.today.duration,
            type: "quick",
          },
        ]);
      });

    // Fetch logs
    fetch("/api/logs/irrigation")
      .then((res) => res.json())
      .then((data) => {
        setLogs(
          data.map((item: any) => ({
            time: new Date(item.time || Date.now()).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            message: `${item.mode} (${item.status})`,
            type: "pump",
          }))
        );
      });
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
      duration: action.includes("intensif") ? 10 : action.includes("hemat") ? 3 : 5,
      type: eventType as "quick" | "intensive" | "water-saving",
    };
    setIrrigationEvents((prev) => [...prev, newEvent]);
  };

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
