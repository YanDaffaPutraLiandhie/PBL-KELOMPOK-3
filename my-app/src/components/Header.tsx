"use client";

import Link from "next/link";
import { Sun, Moon, Wifi, WifiOff, Droplets, ChevronDown } from "lucide-react";

interface HeaderProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
  isOnline: boolean;
}

export default function Header({
  theme,
  onToggleTheme,
  isOnline,
}: HeaderProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header
      className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between"
      style={{
        background:
          theme === "dark"
            ? "rgba(10, 15, 26, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Logo + Title */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #00e5a0, #00c8ff)" }}
        >
          <Droplets className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1
            className="font-bold text-sm leading-tight"
            style={{
              color: "var(--primary)",
              fontFamily: "'Exo 2', sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            Smart Irrigation System
          </h1>
          <p
            className="text-xs"
            style={{
              color: "var(--text-muted)",
              fontFamily: "'Share Tech Mono', monospace",
            }}
          >
            VVPF-DLSGT-JQN-1
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Online Status */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{
            background: isOnline
              ? "rgba(0, 229, 160, 0.1)"
              : "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${isOnline ? "rgba(0, 229, 160, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: isOnline ? "#00e5a0" : "#ef4444",
              boxShadow: isOnline ? "0 0 6px #00e5a0" : "0 0 6px #ef4444",
              animation: "pulse 2s infinite",
            }}
          />
          <span
            className="text-xs font-medium"
            style={{
              color: isOnline ? "#00e5a0" : "#ef4444",
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.65rem",
            }}
          >
            {isOnline ? "ONLINE" : "OFFLINE"}
          </span>
        </div>

        {/* Date/Time */}
        <div className="hidden sm:flex flex-col items-end">
          <span
            className="text-xs"
            style={{
              color: "var(--text-primary)",
              fontFamily: "'Share Tech Mono', monospace",
            }}
          >
            {timeStr}
          </span>
          <span
            className="text-xs"
            style={{
              color: "var(--text-muted)",
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.6rem",
            }}
          >
            {dateStr}
          </span>
        </div>

        <Link
          href="/analytics"
          className="hidden md:inline-flex items-center text-xs px-2.5 py-1 rounded-lg transition-all hover:scale-105"
          style={{
            color: "var(--primary)",
            border: "1px solid var(--border)",
            background: "rgba(0, 200, 255, 0.08)",
            fontFamily: "'Share Tech Mono', monospace",
          }}
        >
          Analytics
        </Link>

        <div className="relative hidden md:block group">
          <button
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all hover:scale-105"
            style={{
              color: "var(--primary)",
              border: "1px solid var(--border)",
              background: "rgba(0, 229, 160, 0.08)",
              fontFamily: "'Share Tech Mono', monospace",
            }}
            aria-label="Menu Manajemen"
          >
            Manajemen
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <div
            className="absolute right-0 mt-2 w-44 rounded-lg p-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
            }}
          >
            <Link
              href="/management/users"
              className="block w-full px-3 py-2 rounded text-xs"
              style={{
                color: "var(--text-primary)",
                fontFamily: "'Share Tech Mono', monospace",
              }}
            >
              Manajemen Pengguna
            </Link>
            <Link
              href="/management/accounts"
              className="block w-full px-3 py-2 rounded text-xs"
              style={{
                color: "var(--text-primary)",
                fontFamily: "'Share Tech Mono', monospace",
              }}
            >
              Manajemen Akun
            </Link>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
          style={{
            background: "var(--bg-600)",
            border: "1px solid var(--border)",
          }}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" style={{ color: "var(--primary)" }} />
          ) : (
            <Moon className="w-4 h-4" style={{ color: "var(--primary)" }} />
          )}
        </button>
      </div>
    </header>
  );
}
