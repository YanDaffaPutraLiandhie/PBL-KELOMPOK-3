import React, { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Mencegah background scroll saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Konten Modal */}
      <div 
        className="card glow-border relative w-full max-w-md p-5 sm:p-6 shadow-2xl"
        style={{ 
          zIndex: 51,
          animation: "modalFadeIn 0.2s ease-out forwards"
        }}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between mb-5 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg sm:text-xl font-bold glow-text" style={{ fontFamily: "'Exo 2', sans-serif" }}>
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors focus:outline-none"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Body Modal */}
        <div className="mt-2 text-sm sm:text-base">
          {children}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}} />
    </div>
  );
}
