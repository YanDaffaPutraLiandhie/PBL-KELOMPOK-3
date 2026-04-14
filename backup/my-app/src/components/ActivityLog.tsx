"use client";

import { useRouter } from "next/router";

interface LogEntry {
  time: string;
  message: string;
  type: string;
}

interface ActivityLogProps {
  logs: LogEntry[];
}

export default function ActivityLog({ logs }: ActivityLogProps) {
  const router = useRouter();

  const handleLogClick = () => {
    router.push('/log-aktivitas');
  };
  return (
    <div className="card p-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleLogClick}>
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-xs font-semibold"
          style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.08em" }}
        >
          Log Aktivitas Penyiraman
        </h3>
        {logs.length > 0 && (
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(0,229,160,0.1)",
              color: "var(--primary)",
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.6rem",
            }}
          >
            {logs.length}
          </span>
        )}
      </div>

      <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-thin">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "var(--bg-600)" }}
            >
              <span style={{ color: "var(--text-muted)", fontSize: "16px" }}>⏳</span>
            </div>
            <p
              className="text-xs text-center"
              style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}
            >
              Belum ada aktivitas Penyiraman
            </p>
          </div>
        ) : (
          logs.map((log, i) => (
            <div
              key={i}
              className="log-entry py-1.5"
              style={{
                borderLeftColor: log.type === "action" ? "var(--primary)" : "#00c8ff",
              }}
            >
              <p style={{ color: "var(--text-muted)", fontSize: "0.6rem" }}>{log.time}</p>
              <p style={{ color: "var(--text-primary)", fontSize: "0.72rem" }}>{log.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
