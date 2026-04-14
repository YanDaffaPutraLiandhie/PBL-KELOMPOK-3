import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DailyStatus {
  date: string;
  avgValue: number;
  variation: number;
  status: 'Stabil' | 'Tidak Stabil';
  minValue: number;
  maxValue: number;
}

interface WeeklyChartProps {
  title: string;
  dataKey: 'suhu' | 'kelembaban';
  unit: string;
  color: string;
}

export default function WeeklyChart({ title, dataKey, unit, color }: WeeklyChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [dailyStatus, setDailyStatus] = useState<DailyStatus[]>([]);

  useEffect(() => {
    // Generate 7 days of hourly data
    const data: any[] = [];
    const status: DailyStatus[] = [];
    const now = new Date();

    for (let day = 6; day >= 0; day--) {
      const currentDate = new Date(now);
      currentDate.setDate(currentDate.getDate() - day);
      const dayLabel = currentDate.toLocaleDateString('id-ID', { weekday: 'short', month: 'short', day: 'numeric' });

      let dayValues: number[] = [];

      for (let hour = 0; hour < 24; hour++) {
        const time = new Date(currentDate);
        time.setHours(hour);
        const timeLabel = time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        let value: number;
        if (dataKey === 'suhu') {
          value = 22 + Math.sin(hour / 24 * Math.PI * 2) * 3 + Math.random() * 2;
        } else {
          value = 55 + Math.sin(hour / 24 * Math.PI * 2) * 8 + Math.random() * 5;
        }

        dayValues.push(value);
        data.push({
          time: `${dayLabel} ${timeLabel}`,
          [dataKey]: parseFloat(value.toFixed(1)),
          day: dayLabel,
        });
      }

      // Calculate daily statistics
      const avgValue = dayValues.reduce((a, b) => a + b) / dayValues.length;
      const minValue = Math.min(...dayValues);
      const maxValue = Math.max(...dayValues);
      const variation = maxValue - minValue;

      // Determine stability (low variation = stable)
      const isStable = variation < 5;

      status.push({
        date: dayLabel,
        avgValue: parseFloat(avgValue.toFixed(1)),
        variation: parseFloat(variation.toFixed(1)),
        status: isStable ? 'Stabil' : 'Tidak Stabil',
        minValue: parseFloat(minValue.toFixed(1)),
        maxValue: parseFloat(maxValue.toFixed(1)),
      });
    }

    setChartData(data);
    setDailyStatus(status);
  }, [dataKey]);

  return (
    <div className="space-y-4">
      {/* Chart Section */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg p-6 border border-slate-700 hover:shadow-xl transition-shadow" style={{ background: 'var(--bg-800)' }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        <div className="bg-slate-900 rounded-lg p-4" style={{ background: 'var(--bg-900)' }}>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #374151)" opacity={0.3} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: 'var(--text-secondary, #9ca3af)' }}
                interval={Math.floor(chartData.length / 14)}
                stroke="var(--border-color, #374151)"
              />
              <YAxis
                label={{ value: unit, angle: -90, position: 'insideLeft', fill: 'var(--text-secondary, #9ca3af)' }}
                domain={dataKey === 'suhu' ? [15, 35] : [20, 90]}
                tick={{ fill: 'var(--text-secondary, #9ca3af)' }}
                stroke="var(--border-color, #374151)"
              />
              <Tooltip
                formatter={(value) => `${value} ${unit}`}
                labelFormatter={(label) => `${label}`}
                contentStyle={{ backgroundColor: 'var(--bg-800, #1f2937)', border: `2px solid ${color}`, borderRadius: '8px', color: 'var(--text-primary, #fff)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '16px' }} />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                dot={false}
                strokeWidth={3}
                isAnimationActive={false}
                name={dataKey === 'suhu' ? 'Suhu (°C)' : 'Kelembaban (%)'}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Status Section */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg p-6 border border-slate-700 hover:shadow-xl transition-shadow" style={{ background: 'var(--bg-800)' }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Status Harian - Seminggu Terakhir</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottomColor: 'var(--border-color, #374151)' }} className="border-b-2">
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text-secondary, #9ca3af)' }}>Tanggal</th>
                <th className="text-center py-3 px-4 font-semibold" style={{ color: 'var(--text-secondary, #9ca3af)' }}>Rata-rata ({unit})</th>
                <th className="text-center py-3 px-4 font-semibold" style={{ color: 'var(--text-secondary, #9ca3af)' }}>Min ({unit})</th>
                <th className="text-center py-3 px-4 font-semibold" style={{ color: 'var(--text-secondary, #9ca3af)' }}>Max ({unit})</th>
                <th className="text-center py-3 px-4 font-semibold" style={{ color: 'var(--text-secondary, #9ca3af)' }}>Variasi</th>
                <th className="text-center py-3 px-4 font-semibold" style={{ color: 'var(--text-secondary, #9ca3af)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {dailyStatus.map((day, idx) => (
                <tr
                  key={idx}
                  style={{ borderBottomColor: 'var(--border-color, #374151)' }}
                  className="border-b hover:bg-opacity-50 transition-colors"
                  suppressHydrationWarning
                >
                  <td className="py-3 px-4 font-medium" style={{ color: 'var(--text-primary, #fff)' }}>{day.date}</td>
                  <td className="text-center py-3 px-4" style={{ color: 'var(--text-secondary, #9ca3af)' }}>{day.avgValue}</td>
                  <td className="text-center py-3 px-4" style={{ color: 'var(--text-secondary, #9ca3af)' }}>{day.minValue}</td>
                  <td className="text-center py-3 px-4" style={{ color: 'var(--text-secondary, #9ca3af)' }}>{day.maxValue}</td>
                  <td className="text-center py-3 px-4" style={{ color: 'var(--text-secondary, #9ca3af)' }}>{day.variation}</td>
                  <td className="text-center py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-white font-semibold text-xs ${
                      day.status === 'Stabil'
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}>
                      {day.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}