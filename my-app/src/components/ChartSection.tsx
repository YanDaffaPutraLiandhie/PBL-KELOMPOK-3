"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { generateChartData } from "@/lib/mockData";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-lg text-xs"
        style={{
          background: "rgba(13, 20, 36, 0.95)",
          border: "1px solid rgba(0, 229, 160, 0.3)",
          fontFamily: "'Share Tech Mono', monospace",
          color: "#e2e8f0",
        }}
      >
        <p style={{ color: "var(--text-muted)" }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {p.value}{p.name === "kelembaban" ? "%" : "°C"}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface ChartSectionProps {
  data: {
    soilMoisture: number;
    temperature: number;
  };
}

export default function ChartSection({ data }: ChartSectionProps) {
  const router = useRouter();
  const [chartData, setChartData] = useState(generateChartData());
  const latestDataRef = useRef(data);

  useEffect(() => {
    latestDataRef.current = data;
  }, [data]);

  useEffect(() => {
    const interval = setInterval(() => {
      setChartData((prev) => {
        const newData = [...prev];
        const now = new Date();
        const label = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        newData.push({
          time: label,
          kelembaban: latestDataRef.current.soilMoisture,
          suhu: latestDataRef.current.temperature,
        });
        if (newData.length > 15) newData.shift();
        return newData;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleKelembapanClick = () => {
    router.push('/histori-kelembapan');
  };

  const handleSuhuClick = () => {
    router.push('/histori-suhu');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {/* Kelembaban Chart */}
      <div className="card p-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleKelembapanClick}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Share Tech Mono', monospace" }}>
              Histori Kelembaban Tanah
            </h3>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>(6 jam)</p>
          </div>
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: "var(--primary)", boxShadow: "0 0 8px var(--primary)" }}
          />
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="kelGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00e5a0" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00e5a0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
            <XAxis
              dataKey="time"
              tick={{ fill: "#64748b", fontSize: 9, fontFamily: "'Share Tech Mono'" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 9, fontFamily: "'Share Tech Mono'" }}
              axisLine={false}
              tickLine={false}
              domain={[20, 80]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="kelembaban"
              stroke="#00e5a0"
              strokeWidth={2}
              fill="url(#kelGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#00e5a0", stroke: "none" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Suhu Chart */}
      <div className="card p-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleSuhuClick}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Share Tech Mono', monospace" }}>
              Histori Suhu
            </h3>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>(6 jam)</p>
          </div>
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: "#00c8ff", boxShadow: "0 0 8px #00c8ff" }}
          />
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="suhuGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00c8ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00c8ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
            <XAxis
              dataKey="time"
              tick={{ fill: "#64748b", fontSize: 9, fontFamily: "'Share Tech Mono'" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 9, fontFamily: "'Share Tech Mono'" }}
              axisLine={false}
              tickLine={false}
              domain={[18, 36]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="suhu"
              stroke="#00c8ff"
              strokeWidth={2}
              fill="url(#suhuGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#00c8ff", stroke: "none" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
