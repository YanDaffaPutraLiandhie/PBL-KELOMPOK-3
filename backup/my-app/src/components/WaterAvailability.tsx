"use client";

import { useState, useEffect } from "react";

interface WaterAvailabilityProps {
  percentage: number;
}

export default function WaterAvailability({ percentage }: WaterAvailabilityProps) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimated(percentage), 500);
    return () => clearTimeout(timeout);
  }, [percentage]);

  const getColor = (pct: number) => {
    if (pct > 60) return "#00e5a0";
    if (pct > 30) return "#f59e0b";
    return "#ef4444";
  };

  const color = getColor(percentage);

  return (
    <div className="card p-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-xs font-semibold"
          style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.08em" }}
        >
          Ketersediaan Air
        </h3>
        <span
          className="text-xs px-2 py-0.5 rounded"
          style={{
            background: `${color}18`,
            color: color,
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "0.65rem",
          }}
        >
          {percentage >= 60 ? "CUKUP" : percentage >= 30 ? "SEDANG" : "KRITIS"}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <p
          className="text-4xl font-bold flex-shrink-0"
          style={{
            color,
            fontFamily: "'Exo 2', sans-serif",
            textShadow: `0 0 25px ${color}60`,
          }}
        >
          {percentage}%
        </p>

        <div className="flex-1">
          <div
            className="h-3 rounded-full overflow-hidden"
            style={{ background: "var(--bg-600)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${animated}%`,
                background: `linear-gradient(90deg, ${color}, ${color}aa)`,
                boxShadow: `0 0 12px ${color}60`,
                transition: "width 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span
              className="text-xs"
              style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", fontSize: "0.6rem" }}
            >
              0%
            </span>
            <span
              className="text-xs"
              style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", fontSize: "0.6rem" }}
            >
              100%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
