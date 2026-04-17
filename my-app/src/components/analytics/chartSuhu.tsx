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
import {
  Thermometer,
  Snowflake,
  BarChart3,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import app from "../../utils/db/firebase";

const db = getFirestore(app);

type SensorDataType = {
  id: string;
  day: string;
  moisture: number;
  temperature: number;
  rawDate: Date;
};

const calculateStats = (data: SensorDataType[], timeRange: number) => {
  if (data.length === 0)
    return { max: "0.0", min: "0.0", avg: "0.0", change: "0.0" };

  const values = data.map((d) => d.temperature);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  const now = new Date();
  let currentValues: number[] = [];
  let previousValues: number[] = [];

  if (timeRange === 1) {
    const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
    const sevenHoursAgo = new Date(now.getTime() - 7 * 60 * 60 * 1000);

    currentValues = data
      .filter((d) => d.rawDate >= oneHourAgo)
      .map((d) => d.temperature);
    previousValues = data
      .filter((d) => d.rawDate >= sevenHoursAgo && d.rawDate < sixHoursAgo)
      .map((d) => d.temperature);
  } else {
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    currentValues = data
      .filter((d) => d.rawDate >= oneDayAgo)
      .map((d) => d.temperature);
    previousValues = data
      .filter((d) => d.rawDate >= sevenDaysAgo && d.rawDate < sixDaysAgo)
      .map((d) => d.temperature);
  }

  const avgRecent = currentValues.length
    ? currentValues.reduce((a, b) => a + b, 0) / currentValues.length
    : values[values.length - 1];

  let avgPrevious = previousValues.length
    ? previousValues.reduce((a, b) => a + b, 0) / previousValues.length
    : 0;

  if (previousValues.length === 0 && data.length > 0) {
    avgPrevious = values[0];
  }

  const changePercent =
    avgPrevious === 0 ? 0 : ((avgRecent - avgPrevious) / avgPrevious) * 100;

  return {
    max: max.toFixed(1),
    min: min.toFixed(1),
    avg: avg.toFixed(1),
    change: changePercent.toFixed(1),
  };
};

export default function ChartSuhu() {
  const [data, setData] = useState<SensorDataType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<number>(1);

  useEffect(() => {
    setIsLoading(true);
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - timeRange);

    const q = query(
      collection(db, "sensorData"),
      where("timestamp", ">=", pastDate),
      orderBy("timestamp", "asc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Objek untuk menampung grouping data
      const groups: Record<
        string,
        {
          totalTemp: number;
          totalMoisture: number;
          count: number;
          rawDate: Date;
        }
      > = {};

      snapshot.docs.forEach((doc) => {
        const docData = doc.data();
        if (
          docData.timestamp &&
          typeof docData.timestamp.toDate === "function"
        ) {
          const dateObj = docData.timestamp.toDate();
          let groupKey = "";

          if (timeRange === 1) {
            // Group berdasarkan Jam (Format: "2024-04-16 22")
            groupKey = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()} ${dateObj.getHours()}`;
          } else {
            // Group berdasarkan Hari (Format: "2024-04-16")
            groupKey = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`;
          }

          if (!groups[groupKey]) {
            groups[groupKey] = {
              totalTemp: 0,
              totalMoisture: 0,
              count: 0,
              rawDate: dateObj,
            };
          }

          groups[groupKey].totalTemp += docData.temperature || 0;
          groups[groupKey].totalMoisture += docData.soilMoisture || 0;
          groups[groupKey].count += 1;
        }
      });

      // Konversi hasil grouping menjadi array yang sudah dirata-rata
      const aggregatedData: SensorDataType[] = Object.keys(groups).map(
        (key) => {
          const group = groups[key];
          const dateObj = group.rawDate;

          let dateStr = "";
          if (timeRange === 1) {
            dateStr = dateObj.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            });
          } else {
            dateStr = dateObj.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            });
          }

          return {
            id: key,
            day: dateStr,
            temperature: group.totalTemp / group.count, // Rata-rata suhu
            moisture: group.totalMoisture / group.count, // Rata-rata kelembapan
            rawDate: dateObj,
          };
        },
      );

      setData(aggregatedData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [timeRange]);

  const stats = calculateStats(data, timeRange);
  const isDown = Number(stats.change) < 0;

  return (
    <div
      className="rounded-xl p-4 shadow-md text-white"
      style={{ background: "var(--bg-800)" }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          Suhu ({timeRange === 1 ? "24 Jam" : "7 Hari"})
        </h2>
        <div className="flex bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setTimeRange(1)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${timeRange === 1 ? "bg-orange-500 text-white" : "text-gray-400 hover:text-white"}`}
          >
            1 Hari
          </button>
          <button
            onClick={() => setTimeRange(7)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${timeRange === 7 ? "bg-orange-500 text-white" : "text-gray-400 hover:text-white"}`}
          >
            7 Hari
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[300px] text-gray-400">
          Memuat data...
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-gray-400">
          Belum ada data sensor.
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="day" stroke="#888" tick={{ fontSize: 12 }} />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{ backgroundColor: "#333", borderColor: "#444" }}
                itemStyle={{ color: "#f97316" }}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#f97316"
                strokeWidth={2}
                dot={true}
              />
            </LineChart>
          </ResponsiveContainer>

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
                  <td className="py-1 flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-red-500" /> Suhu
                    Tertinggi
                  </td>
                  <td>{stats.max} °C</td>
                </tr>
                <tr>
                  <td className="py-1 flex items-center gap-2">
                    <Snowflake className="w-4 h-4 text-blue-400" /> Suhu
                    Terendah
                  </td>
                  <td>{stats.min} °C</td>
                </tr>
                <tr>
                  <td className="py-1 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-orange-400" /> Rata-rata
                  </td>
                  <td>{stats.avg} °C</td>
                </tr>
                <tr>
                  <td className="py-1 flex items-center gap-2">
                    {isDown ? (
                      <TrendingDown className="w-4 h-4 text-blue-400" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-red-400" />
                    )}{" "}
                    Tren
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      {isDown ? (
                        <TrendingDown className="w-4 h-4 text-blue-400" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-red-400" />
                      )}
                      {stats.change}%
                    </div>
                    <div className="text-xs text-gray-400">
                      {timeRange === 1
                        ? "dibanding 6 jam yang lalu"
                        : "dibanding 6 hari yang lalu"}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
