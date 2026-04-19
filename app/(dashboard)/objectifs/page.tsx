"use client";

import { useState } from "react";
import { Plus, X, Target, TrendingUp, Wallet, Trophy } from "lucide-react";

const initialObjectifs = [
  { id: 1, title: "Vacances Été 2025", emoji: "✈️", target: 3000, saved: 1850, deadline: "2025-06-01", colorHex: "#3B82F6" },
  { id: 2, title: "Fonds d'urgence", emoji: "🛡️", target: 5000, saved: 4200, deadline: "2024-12-31", colorHex: "#10B981" },
  { id: 3, title: "Nouvel ordinateur", emoji: "💻", target: 1500, saved: 320, deadline: "2025-03-01", colorHex: "#F59E0B" },
  { id: 4, title: "Voiture", emoji: "🚗", target: 12000, saved: 2400, deadline: "2026-01-01", colorHex: "#8B5CF6" },
];

export default function ObjectifsPage() {
  const [objectifs, setObjectifs] = useState(initialObjectifs);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const totalSaved = objectifs.reduce((s, o) => s + o.saved, 0);
  const totalTarget = objectifs.reduce((s, o) => s + o.target, 0);
  const completed = objectifs.filter(o => o.saved >= o.target).length;
  const globalPct = Math.round((totalSaved / totalTarget) * 100);

  const formatDeadline = (d: string) => new Date(d).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const getStatus = (o: typeof initialObjectifs[0]) => {
    const pct = (o.saved / o.target) * 100;
    if (pct >= 100) return { label: "Complété", color: "text-success", bg: "bg-success/10" };
    if (pct >= 75) return { label: "Presque", color: "text-secondary", bg: "bg-secondary/10" };
    if (pct >= 40) return { label: "En cours", color: "text-warning", bg: "bg-warning/10" };
    return { label: "Débuté", color: "text-tertiary", bg: "bg-neutral" };
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
            Objectifs d'épargne
          </h1>
          <p className="text-tertiary text-sm mt-1">Fixez des objectifs et atteignez l'équilibre financier.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Nouvel objectif
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Objectifs actifs", value: `${objectifs.length}`, sub: `${completed} complété${completed > 1 ? "s" : ""}`, icon: Target, iconColor: "text-secondary", iconBg: "bg-secondary/10" },
          { label: "Total épargné", value: `${totalSaved.toLocaleString()} €`, sub: `Sur ${totalTarget.toLocaleString()} € visés`, icon: Wallet, iconColor: "text-success", iconBg: "bg-success/10" },
          { label: "Progression globale", value: `${globalPct}%`, sub: "Tous objectifs confondus", icon: TrendingUp, iconColor: "text-warning", iconBg: "bg-warning/10" },
          { label: "Complétés", value: `${completed}`, sub: `${objectifs.length - completed} en cours`, icon: Trophy, iconColor: "text-warning", iconBg: "bg-warning/10" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-tertiary uppercase tracking-wide">{kpi.label}</p>
              <div className={`w-8 h-8 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                <kpi.icon size={15} className={kpi.iconColor} />
              </div>
            </div>
            <p className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>{kpi.value}</p>
            <p className="text-xs text-tertiary mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Cards objectifs */}
      <div className="grid grid-cols-2 gap-4">
        {objectifs.map((o) => {
          const pct = Math.min((o.saved / o.target) * 100, 100);
          const reste = o.target - o.saved;
          const status = getStatus(o);
          const isSelected = selectedId === o.id;

          return (
            <div
              key={o.id}
              onClick={() => setSelectedId(isSelected ? null : o.id)}
              className="bg-white border border-border rounded-2xl p-5 cursor-pointer hover:border-secondary/40 transition-all"
              style={{ borderColor: isSelected ? o.colorHex : undefined }}
            >
              {/* Top */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: `${o.colorHex}15` }}>
                    {o.emoji}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">{o.title}</p>
                    <p className="text-xs text-tertiary mt-0.5">Échéance : {formatDeadline(o.deadline)}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${status.bg} ${status.color}`}>
                  {status.label}
                </span>
              </div>

              {/* Montants */}
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-xs text-tertiary mb-1">Épargné</p>
                  <p className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
                    {o.saved.toLocaleString()} €
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-tertiary mb-1">Objectif</p>
                  <p className="text-xl font-bold text-tertiary" style={{ fontFamily: "var(--font-heading)" }}>
                    {o.target.toLocaleString()} €
                  </p>
                </div>
              </div>

              {/* Barre */}
              <div className="w-full bg-neutral rounded-full h-2.5 mb-2">
                <div
                  className="h-2.5 rounded-full transition-all"
                  style={{ width: `${pct}%`, background: o.colorHex }}
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold" style={{ color: o.colorHex }}>
                  {pct.toFixed(0)}%
                </span>
                <span className="text-xs text-tertiary">
                  {reste > 0 ? `${reste.toLocaleString()} € restant` : "Objectif atteint 🎉"}
                </span>
              </div>

              {/* Actions dépliables */}
              {isSelected && (
                <div className="mt-4 pt-4 border-t border-border flex gap-2">
                  <input
                    type="number"
                    placeholder="Montant à ajouter (€)"
                    className="flex-1 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-secondary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors"
                  >
                    Ajouter
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
                Nouvel objectif
              </h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-neutral flex items-center justify-center text-tertiary hover:text-primary transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Nom de l'objectif</label>
                <input type="text" placeholder="Ex: Vacances été" className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-secondary transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Montant visé (€)</label>
                  <input type="number" placeholder="0" className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-secondary transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Déjà épargné (€)</label>
                  <input type="number" placeholder="0" className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-secondary transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Échéance</label>
                <input type="date" className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-secondary transition-colors" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-border text-tertiary py-3 rounded-xl text-sm font-semibold hover:bg-neutral transition-colors">
                Annuler
              </button>
              <button className="flex-1 bg-primary text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors">
                Créer →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}