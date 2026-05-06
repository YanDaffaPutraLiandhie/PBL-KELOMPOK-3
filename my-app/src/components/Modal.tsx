import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl mx-4">
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            boxShadow:
              "0 0 30px rgba(0, 0, 0, 0.45), 0 0 25px rgba(0, 229, 160, 0.08)",
          }}
        >
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <h3
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-xl leading-none transition-colors"
              style={{ color: "var(--text-muted)" }}
              aria-label="close modal"
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-muted)")
              }
            >
              ×
            </button>
          </div>
          <div className="p-6" style={{ background: "transparent" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
