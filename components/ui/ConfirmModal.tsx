"use client";

import { X } from "lucide-react";

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmModal({ title, message, confirmLabel = "Supprimer", onConfirm, onCancel, danger = true }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>{title}</h2>
          <button onClick={onCancel} className="w-8 h-8 rounded-lg bg-neutral flex items-center justify-center text-tertiary hover:text-primary transition-colors">
            <X size={16} />
          </button>
        </div>
        <p className="text-sm text-tertiary mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 border border-border text-tertiary py-3 rounded-xl text-sm font-semibold hover:bg-neutral transition-colors">
            Annuler
          </button>
          <button onClick={onConfirm} className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors text-white ${danger ? "bg-danger hover:opacity-90" : "bg-primary hover:bg-primary-light"}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}