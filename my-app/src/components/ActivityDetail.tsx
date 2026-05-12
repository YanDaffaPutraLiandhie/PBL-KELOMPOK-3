import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface LogEntry {
  time: string;
  message: string;
  type: string;
  timestamp: Date;
}

interface ActivityDetailProps {
  logs?: LogEntry[];
}

enum TimePeriod {
  TODAY = "today",
  THIS_WEEK = "week",
  THIS_MONTH = "month",
}

export default function ActivityDetail({ logs = [] }: ActivityDetailProps) {
  const [expandedPeriod, setExpandedPeriod] = useState<TimePeriod | null>(
    TimePeriod.TODAY,
  );

  // Convert Firebase logs to component format
  const convertLogs = (firebaseLogs: any[]): LogEntry[] => {
    return firebaseLogs.map((log) => ({
      time: log.timestamp.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      message: log.message,
      type: log.type,
      timestamp: log.timestamp,
    }));
  };

  // Generate sample logs with timestamps (fallback if no logs from Firebase)
  const generateLogsWithTimestamps = (): LogEntry[] => {
    const now = new Date();
    const sampleMessages = [
      { msg: "Pompa dihidupkan (AKTIF)", type: "pump" },
      { msg: "Pompa dimatikan (NON-AKTIF)", type: "pump" },
      { msg: "Mode penyiraman cepat diaktifkan", type: "action" },
      { msg: "Mode penyiraman intensif diaktifkan", type: "action" },
      { msg: "Mode hemat air diaktifkan", type: "action" },
    ];

    const generatedLogs: LogEntry[] = [];

    // Today's logs (10-20 entries)
    for (let i = 0; i < 15; i++) {
      const date = new Date(now);
      date.setHours(Math.floor(Math.random() * 24));
      date.setMinutes(Math.floor(Math.random() * 60));
      const sample =
        sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
      generatedLogs.push({
        time: date.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        message: sample.msg,
        type: sample.type,
        timestamp: date,
      });
    }

    // This week's logs (20-30 additional entries)
    for (let i = 0; i < 25; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - Math.floor(Math.random() * 6));
      date.setHours(Math.floor(Math.random() * 24));
      date.setMinutes(Math.floor(Math.random() * 60));
      const sample =
        sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
      generatedLogs.push({
        time: date.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        message: sample.msg,
        type: sample.type,
        timestamp: date,
      });
    }

    // This month's logs (30-40 additional entries)
    for (let i = 0; i < 35; i++) {
      const date = new Date(now);
      date.setDate(Math.floor(Math.random() * 28) + 1);
      date.setHours(Math.floor(Math.random() * 24));
      date.setMinutes(Math.floor(Math.random() * 60));
      const sample =
        sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
      generatedLogs.push({
        time: date.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        message: sample.msg,
        type: sample.type,
        timestamp: date,
      });
    }

    return generatedLogs;
  };

  const allLogs =
    logs.length > 0 ? convertLogs(logs) : generateLogsWithTimestamps();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);
  const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);

  // Filter logs by period
  const todayLogs = allLogs.filter((log) => {
    const logDate = new Date(log.timestamp);
    return logDate >= today;
  });

  const thisWeekLogs = allLogs.filter((log) => {
    const logDate = new Date(log.timestamp);
    return logDate >= weekAgo && logDate < today;
  });

  const thisMonthLogs = allLogs.filter((log) => {
    const logDate = new Date(log.timestamp);
    return logDate >= monthAgo && logDate < weekAgo;
  });

  const togglePeriod = (period: TimePeriod) => {
    setExpandedPeriod(expandedPeriod === period ? null : period);
  };

  const LogSection = ({
    period,
    title,
    logs: sectionLogs,
    count,
  }: {
    period: TimePeriod;
    title: string;
    logs: LogEntry[];
    count: number;
  }) => {
    const isExpanded = expandedPeriod === period;

    return (
      <div
        className="border rounded-lg overflow-hidden"
        style={{ borderColor: "var(--border-color, #374151)" }}
      >
        <button
          onClick={() => togglePeriod(period)}
          className="w-full flex items-center justify-between p-4 hover:opacity-80 transition-opacity"
          style={{ background: "var(--bg-800)" }}
        >
          <div className="flex items-center gap-3">
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </h3>
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{
                background: "var(--bg-700)",
                color: "var(--text-secondary)",
              }}
            >
              {count}
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp size={20} style={{ color: "var(--text-secondary)" }} />
          ) : (
            <ChevronDown size={20} style={{ color: "var(--text-secondary)" }} />
          )}
        </button>

        {isExpanded && (
          <div
            className="divide-y"
            style={{ borderTopColor: "var(--border-color, #374151)" }}
          >
            {sectionLogs.length === 0 ? (
              <div
                className="p-4 text-center"
                style={{ background: "var(--bg-900)" }}
              >
                <p style={{ color: "var(--text-muted)" }} className="text-sm">
                  Tidak ada log untuk periode ini
                </p>
              </div>
            ) : (
              sectionLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="p-4 border-l-4 transition-colors hover:opacity-80"
                  style={{
                    background: "var(--bg-900)",
                    borderLeftColor:
                      log.type === "action"
                        ? "var(--primary, #00e5a0)"
                        : "#00c8ff",
                  }}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p
                        style={{ color: "var(--text-muted)" }}
                        className="text-xs mb-1"
                      >
                        {new Date(log.timestamp).toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        {log.time}
                      </p>
                      <p
                        style={{ color: "var(--text-primary)" }}
                        className="text-sm font-medium"
                      >
                        {log.message}
                      </p>
                    </div>
                    <span
                      className="text-xs px-3 py-1 rounded-full whitespace-nowrap"
                      style={{
                        background:
                          log.type === "action"
                            ? "rgba(0, 229, 160, 0.1)"
                            : "rgba(0, 200, 255, 0.1)",
                        color:
                          log.type === "action"
                            ? "var(--primary, #00e5a0)"
                            : "#00c8ff",
                      }}
                    >
                      {log.type === "action" ? "Aksi" : "Pompa"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Log Aktivitas
        </h2>
        <p style={{ color: "var(--text-secondary)" }} className="text-sm mt-1">
          Total: {allLogs.length} aktivitas
        </p>
      </div>

      <LogSection
        period={TimePeriod.TODAY}
        title="Hari Ini"
        logs={todayLogs}
        count={todayLogs.length}
      />

      <LogSection
        period={TimePeriod.THIS_WEEK}
        title="Minggu Ini"
        logs={thisWeekLogs}
        count={thisWeekLogs.length}
      />

      <LogSection
        period={TimePeriod.THIS_MONTH}
        title="Bulan Ini"
        logs={thisMonthLogs}
        count={thisMonthLogs.length}
      />
    </div>
  );
}
