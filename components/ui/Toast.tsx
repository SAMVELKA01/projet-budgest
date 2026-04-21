"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning";

export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
}

interface Props {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: Props) {
  return (
    <div className="fixed top-4 right-4 z-100 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 10);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const config = {
    success: { icon: CheckCircle, bg: "bg-white", border: "border-success/30", iconColor: "text-success", bar: "bg-success" },
    error: { icon: XCircle, bg: "bg-white", border: "border-danger/30", iconColor: "text-danger", bar: "bg-danger" },
    warning: { icon: AlertTriangle, bg: "bg-white", border: "border-warning/30", iconColor: "text-warning", bar: "bg-warning" },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 ${config.bg} border ${config.border} rounded-2xl px-4 py-3 shadow-lg min-w-72 max-w-sm transition-all duration-300 overflow-hidden`}
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(100%)" }}
    >
      <Icon size={18} className={`${config.iconColor} shrink-0 mt-0.5`} />
      <p className="text-sm font-medium text-primary flex-1">{toast.message}</p>
      <button onClick={() => onRemove(toast.id)} className="text-tertiary hover:text-primary transition-colors shrink-0">
        <X size={14} />
      </button>
      <div className={`absolute bottom-0 left-0 h-0.5 ${config.bar} animate-shrink`} style={{ width: "100%" }} />
    </div>
  );
}