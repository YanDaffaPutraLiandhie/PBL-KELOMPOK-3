"use client";

import { useState } from "react";

interface IrrigationEvent {
  timestamp: Date;
  duration: number;
  type: "quick" | "intensive" | "water-saving";
}

interface TimePeriodStats {
  period: "today" | "week" | "month";
  label: string;
  count: number;
  totalDuration: number;
  events: IrrigationEvent[];
}

interface IrrigationTrackingProps {
  irrigationData: IrrigationEvent[];
}

export default function IrrigationTracking({ irrigationData }: IrrigationTrackingProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("today");

  const getTimePeriodStats = (): TimePeriodStats => {
    const now = new Date();
    let startDate = new Date();

    if (selectedPeriod === "today") {
      startDate.setHours(0, 0, 0, 0);
    } else if (selectedPeriod === "week") {
      const day = now.getDay();
      const diff = now.getDate() - day;
      startDate.setDate(diff);
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    }

    const filtered = irrigationData.filter(
      (event) => new Date(event.timestamp) >= startDate && new Date(event.timestamp) <= now
    );

    const totalDuration = filtered.reduce((sum, ev) => sum + ev.duration, 0);

    return {
      period: selectedPeriod,
      label: selectedPeriod === "today" ? "Hari Ini" : selectedPeriod === "week" ? "Minggu Ini" : "Bulan Ini",
      count: filtered.length,
      totalDuration,
      events: filtered,
    };
  };

  const stats = getTimePeriodStats();
  const typeColors: Record<string, string> = {
    quick: "#00e5a0",
    intensive: "#00c8ff",
    "water-saving": "#7c3aed",
  };

  const typeLabels: Record<string, string> = {
    quick: "Siram Cepat",
    intensive: "Siram Intensif",
    "water-saving": "Mode Hemat",
  };

  return (
    <div className="card p-4">
      <h3
        className="text-xs font-semibold mb-4"
        style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.08em" }}
      >
        Statistik Penyiraman
      </h3>

      {/* Tab Period Selection */}
      <div className="flex gap-2 mb-4">
        {["today", "week", "month"].map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period as "today" | "week" | "month")}
            className="text-xs px-3 py-1.5 rounded transition-all"
            style={{
              background:
                selectedPeriod === period
                  ? "rgba(0, 229, 160, 0.3)"
                  : "rgba(0, 229, 160, 0.1)",
              border:
                selectedPeriod === period
                  ? "1px solid rgba(0, 229, 160, 0.6)"
                  : "1px solid rgba(0, 229, 160, 0.2)",
              color:
                selectedPeriod === period
                  ? "var(--primary)"
                  : "var(--text-muted)",
              fontFamily: "'Share Tech Mono', monospace",
              fontWeight: selectedPeriod === period ? "600" : "400",
            }}
          >
            {period === "today" ? "Hari Ini" : period === "week" ? "Minggu Ini" : "Bulan Ini"}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div
          className="p-3 rounded-lg"
          style={{
            background: "rgba(0, 229, 160, 0.1)",
            border: "1px solid rgba(0, 229, 160, 0.2)",
          }}
        >
          <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
            Total Penyiraman
          </p>
          <p
            className="text-2xl font-bold mt-1"
            style={{ color: "var(--primary)", fontFamily: "'Exo 2', sans-serif" }}
          >
            {stats.count}x
          </p>
        </div>
        <div
          className="p-3 rounded-lg"
          style={{
            background: "rgba(0, 200, 255, 0.1)",
            border: "1px solid rgba(0, 200, 255, 0.2)",
          }}
        >
          <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
            Durasi Total
          </p>
          <p
            className="text-2xl font-bold mt-1"
            style={{ color: "#00c8ff", fontFamily: "'Exo 2', sans-serif" }}
          >
            {stats.totalDuration}m
          </p>
        </div>
      </div>

      {/* Irrigation Type Breakdown */}
      <div className="space-y-2">
        {["quick", "intensive", "water-saving"].map((type) => {
          const count = stats.events.filter((e) => e.type === type).length;
          const duration = stats.events
            .filter((e) => e.type === type)
            .reduce((sum, e) => sum + e.duration, 0);

          return (
            <div
              key={type}
              className="flex items-center justify-between p-2.5 rounded-lg"
              style={{ background: `${typeColors[type]}15` }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{
                    background: typeColors[type],
                    boxShadow: `0 0 8px ${typeColors[type]}`,
                  }}
                />
                <span
                  className="text-xs"
                  style={{ color: "var(--text-primary)", fontFamily: "'Exo 2', sans-serif" }}
                >
                  {typeLabels[type]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-bold"
                  style={{ color: typeColors[type], fontFamily: "'Share Tech Mono', monospace" }}
                >
                  {count}x • {duration}m
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mini bar chart for visual representation */}
      <div className="mt-4 space-y-1.5">
        {["quick", "intensive", "water-saving"].map((type) => {
          const count = stats.events.filter((e) => e.type === type).length;
          const maxCount = Math.max(
            ...["quick", "intensive", "water-saving"].map((t) => stats.events.filter((e) => e.type === t).length),
            1
          );

          return (
            <div key={type} className="h-1 rounded-full" style={{ background: "var(--bg-600)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(count / maxCount) * 100}%`,
                  background: typeColors[type],
                  boxShadow: `0 0 6px ${typeColors[type]}60`,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
