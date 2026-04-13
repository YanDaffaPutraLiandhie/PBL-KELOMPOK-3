"use client";

import { useState } from "react";
import { Zap, RefreshCw, Power } from "lucide-react";

interface IrrigationModesProps {
  onAction: (action: string) => void;
  isPumpActive: boolean;
}

const irrigationModes = [
  {
    label: "Siram Cepat (5 detik)",
    color: "#00e5a0",
    action: "Penyiraman cepat diaktifkan (5 detik)",
  },
  {
    label: "Siram Intensif (10 detik)",
    color: "#00c8ff",
    action: "Penyiraman intensif diaktifkan (10 detik)",
  },
  {
    label: "Siram Hemat (20 detik)",
    color: "#7c3aed",
    action: "Penyiraman hemat diaktifkan (20 detik)",
  },
];

export default function IrrigationModes({ onAction, isPumpActive }: IrrigationModesProps) {
  const [loading, setLoading] = useState<number | null>(null);

  const handleClick = async (index: number, action: string) => {
    if (!isPumpActive) return; // Prevent action if pump is not active
    setLoading(index);
    await new Promise((r) => setTimeout(r, 800));
    onAction(action);
    setLoading(null);
  };

  return (
    <div className="card p-4 mt-4">
      <h3
        className="text-xs font-semibold mb-4"
        style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.08em" }}
      >
        Kontrol Manual - Mode Penyiraman
      </h3>

      <div className="grid grid-cols-3 gap-3">
        {irrigationModes.map((btn, i) => (
          <button
            key={i}
            onClick={() => handleClick(i, btn.action)}
            disabled={loading !== null || !isPumpActive}
            className="btn-quick relative overflow-hidden"
            style={{
              background: `${btn.color}15`,
              borderColor: `${btn.color}50`,
              color: btn.color,
              opacity: loading !== null && loading !== i ? 0.5 : !isPumpActive ? 0.4 : 1,
              cursor: !isPumpActive ? "not-allowed" : "pointer",
            }}
          >
            {loading === i ? (
              <span className="flex items-center justify-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <span>{btn.label}</span>
                {!isPumpActive && <span className="text-xs">(⊘ Nonaktif)</span>}
              </span>
            )}

            {/* Shimmer on hover */}
            <span
              className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
              style={{
                background: `linear-gradient(135deg, transparent 30%, ${btn.color}20 50%, transparent 70%)`,
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
