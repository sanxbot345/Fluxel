import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toasts: ToastItem[];
  setToasts: React.Dispatch<React.SetStateAction<ToastItem[]>>;
}

export default function Toast({ toasts, setToasts }: ToastProps) {
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-md w-full px-4 md:px-0">
      {toasts.map((toast) => {
        const Icon =
          toast.type === "success"
            ? CheckCircle
            : toast.type === "error"
            ? AlertCircle
            : Info;

        const colorClasses =
          toast.type === "success"
            ? "border-emerald-500/30 text-emerald-400 bg-emerald-950/25"
            : toast.type === "error"
            ? "border-rose-500/30 text-rose-400 bg-rose-950/25"
            : "border-blue-500/30 text-blue-400 bg-blue-950/25";

        return (
          <div
            key={toast.id}
            className={`flex items-start md:items-center justify-between gap-3 p-4 rounded-xl border liquid-glass shadow-2xl transition-all duration-300 animate-slide-in ${colorClasses}`}
            style={{
              boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)",
              animation: "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium tracking-wide font-sans leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-white/5 transition-colors focus:outline-none"
            >
              <X className="w-4 h-4 opacity-60 hover:opacity-100" />
            </button>
          </div>
        );
      })}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(20px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
