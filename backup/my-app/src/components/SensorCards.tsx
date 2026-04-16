"use client";

import { Droplets, Thermometer, Activity, Power } from "lucide-react";
import { useState } from "react";

interface SensorData {
  soilMoisture: number;
  temperature: number;
  pumpStatus: string;
}

interface SensorCardsProps {
  data: SensorData;
  onPumpToggle?: (state: boolean) => void;
}

export default function SensorCards({ data, onPumpToggle }: SensorCardsProps) {
  const isPumpActive = data.pumpStatus === "AKTIF";
  const [isLoading, setIsLoading] = useState(false);

  const handleTogglePump = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    if (onPumpToggle) {
      onPumpToggle(!isPumpActive);
    }
    setIsLoading(false);
  };

  return (
    <div className="grid grid-cols-3 gap-3 mt-4">
      {/* Kelembaban Tanah */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
            Kelembaban Tanah
          </p>
          <Droplets className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
        </div>
        <p
          className="text-3xl font-bold glow-text"
          style={{ color: "var(--primary)", fontFamily: "'Exo 2', sans-serif" }}
        >
          {data.soilMoisture}%
        </p>
        <div className="mt-3 h-1.5 rounded-full" style={{ background: "var(--bg-600)" }}>
          <div
            className="progress-bar h-full"
            style={{ width: `${data.soilMoisture}%` }}
          />
        </div>
      </div>

      {/* Suhu Lingkungan */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
            Suhu Lingkungan
          </p>
          <Thermometer className="w-3.5 h-3.5" style={{ color: "#00c8ff" }} />
        </div>
        <p
          className="text-3xl font-bold"
          style={{ color: "#00c8ff", fontFamily: "'Exo 2', sans-serif", textShadow: "0 0 20px rgba(0,200,255,0.5)" }}
        >
          {data.temperature}°
        </p>
        <div className="mt-3 h-1.5 rounded-full" style={{ background: "var(--bg-600)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${((data.temperature - 15) / 25) * 100}%`,
              background: "linear-gradient(90deg, #00c8ff, #0080ff)",
              boxShadow: "0 0 10px rgba(0,200,255,0.4)",
              transition: "width 0.8s ease",
            }}
          />
        </div>
      </div>

      {/* Status Pompa */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
            Status 
          </p>
          <Activity className="w-3.5 h-3.5" style={{ color: isPumpActive ? "var(--primary)" : "#ef4444" }} />
        </div>
        <p
          className="text-2xl font-bold"
          style={{
            color: isPumpActive ? "var(--primary)" : "#ef4444",
            fontFamily: "'Share Tech Mono', monospace",
            textShadow: isPumpActive ? "0 0 20px rgba(0,229,160,0.5)" : "0 0 20px rgba(239,68,68,0.5)",
          }}
        >
          {data.pumpStatus}
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          <span
            className="sensor-dot"
            style={{ background: isPumpActive ? "var(--primary)" : "#ef4444" }}
          />
          <span className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
            {isPumpActive ? "Beroperasi" : "Standby"}
          </span>
        </div>
        {/* Progress placeholder for 3rd card */}
        <div className="mt-2 h-1.5 rounded-full" style={{ background: "var(--bg-600)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: isPumpActive ? "67%" : "10%",
              background: isPumpActive
                ? "linear-gradient(90deg, #00e5a0, #00c8ff)"
                : "linear-gradient(90deg, #ef4444, #f97316)",
              transition: "width 0.8s ease",
            }}
          />
        </div>

        {/* Control Button */}
        {onPumpToggle && (
          <button
            onClick={handleTogglePump}
            disabled={isLoading}
            className="w-full mt-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5"
            style={{
              background: isPumpActive
                ? "rgba(239, 68, 68, 0.2)"
                : "rgba(0, 229, 160, 0.2)",
              border: `1px solid ${isPumpActive ? "rgba(239, 68, 68, 0.5)" : "rgba(0, 229, 160, 0.5)"}`,
              color: isPumpActive ? "#ef4444" : "var(--primary)",
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
              fontFamily: "'Share Tech Mono', monospace",
            }}
          >
            <Power className="w-3 h-3" />
            <span>{isLoading ? "..." : isPumpActive ? "MATIKAN" : "HIDUPKAN"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
