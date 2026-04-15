"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type DataType = {
  day: number;
  moisture: number;
};

const calculateStats = (data: DataType[]) => {
  const values = data.map((d) => d.moisture);

  const max = Math.max(...values);
  const min = Math.min(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  const recent = values.slice(-6);
  const previous = values.slice(-12, -6);

  const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
  const avgPrevious = previous.reduce((a, b) => a + b, 0) / previous.length;

  const changePercent = ((avgRecent - avgPrevious) / avgPrevious) * 100;

  return {
    max: max.toFixed(1),
    min: min.toFixed(1),
    avg: avg.toFixed(1),
    change: changePercent.toFixed(1),
  };
};

export default function ChartKelembapan() {
  const [data, setData] = useState<DataType[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);

    const generated = Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      moisture: 40 + Math.floor(Math.random() * 15),
    }));

    setData(generated);
  }, []);

  if (!isHydrated) return null; 

  const stats = calculateStats(data);
  const isDown = Number(stats.change) < 0;

  return (
    <div
      className="rounded-xl p-4 shadow-md"
      style={{ background: "var(--bg-800)" }}
    >
      <h2 className="text-lg font-semibold mb-3">
        Kelembapan Tanah (30 Hari)
      </h2>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="moisture"
            stroke="#22c55e"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Statistik */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="py-2">Parameter</th>
              <th>Nilai</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-1"> Kelembapan Tertinggi</td>
              <td>{stats.max} %</td>
            </tr>
            <tr>
              <td className="py-1"> Kelembapan Terendah</td>
              <td>{stats.min} %</td>
            </tr>
            <tr>
              <td className="py-1"> Rata-rata</td>
              <td>{stats.avg} %</td>
            </tr>
            <tr>
              <td className="py-1"> Tren</td>
              <td>
                {isDown ? " Turun" : " Naik"} {stats.change}%
                <div className="text-xs text-gray-400">
                  dibanding 6 hari sebelumnya
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}