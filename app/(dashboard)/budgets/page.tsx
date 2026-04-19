"use client";

import { useState } from "react";
import { Plus, X, TrendingUp, TrendingDown, Wallet, AlertTriangle } from "lucide-react";

const initialBudgets = [
  { id: 1, category: "Alimentation", icon: "🛒", allocated: 400, spent: 280, colorHex: "#10B981" },
  { id: 2, category: "Logement", icon: "🏠", allocated: 900, spent: 962, colorHex: "#3B82F6" },
  { id: 3, category: "Transport", icon: "🚗", allocated: 150, spent: 122, colorHex: "#F59E0B" },
  { id: 4, category: "Loisirs", icon: "🎮", allocated: 200, spent: 42, colorHex: "#8B5CF6" },
  { id: 5, category: "Abonnements", icon: "📱", allocated: 50, spent: 27, colorHex: "#EC4899" },
  { id: 6, category: "Santé", icon: "💊", allocated: 100, spent: 79, colorHex: "#64748B" },
];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState(initialBudgets);
  const [showModal, setShowModal] = useState(false);

  const totalAlloue = budgets.reduce((s, b) => s + b.allocated, 0);
  const totalDepense = budgets.reduce((s, b) => s + b.spent, 0);
  const reste = totalAlloue - totalDepense;
  const tauxGlobal = Math.round((totalDepense / totalAlloue) * 100);
  const budgetsOk = budgets.filter(b => b.spent <= b.allocated).length;
  const budgetsOver = budgets.filter(b => b.spent > b.allocated).length;

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
            Budgets
          </h1>
          <p className="text-tertiary text-sm mt-1">Suivez vos plafonds de dépenses par catégorie.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Nouveau budget
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-tertiary uppercase tracking-wide">Total alloué</p>
            <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Wallet size={15} className="text-secondary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
            {totalAlloue.toLocaleString()} €
          </p>
          <p className="text-xs text-tertiary mt-1">{budgets.length} catégories</p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-tertiary uppercase tracking-wide">Total dépensé</p>
            <div className="w-8 h-8 rounded-xl bg-danger/10 flex items-center justify-center">
              <TrendingDown size={15} className="text-danger" />
            </div>
          </div>
          <p className="text-2xl font-bold text-danger" style={{ fontFamily: "var(--font-heading)" }}>
            {totalDepense.toLocaleString()} €
          </p>
          <p className="text-xs text-tertiary mt-1">{tauxGlobal}% du budget utilisé</p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-tertiary uppercase tracking-wide">Reste disponible</p>
            <div className="w-8 h-8 rounded-xl bg-success/10 flex items-center justify-center">
              <TrendingUp size={15} className="text-success" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${reste >= 0 ? "text-success" : "text-danger"}`} style={{ fontFamily: "var(--font-heading)" }}>
            {reste >= 0 ? "+" : ""}{reste.toLocaleString()} €
          </p>
          <p className="text-xs text-tertiary mt-1">{budgetsOk} budgets respectés</p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-tertiary uppercase tracking-wide">Alertes</p>
            <div className="w-8 h-8 rounded-xl bg-warning/10 flex items-center justify-center">
              <AlertTriangle size={15} className="text-warning" />
            </div>
          </div>
          <p className="text-2xl font-bold text-warning" style={{ fontFamily: "var(--font-heading)" }}>
            {budgetsOver}
          </p>
          <p className="text-xs text-tertiary mt-1">
            {budgetsOver === 0 ? "Aucun dépassement" : `${budgetsOver} dépassement${budgetsOver > 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Barre globale */}
      <div className="bg-white border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-primary">Utilisation globale du budget</p>
          <span className={`text-sm font-bold ${tauxGlobal > 90 ? "text-danger" : tauxGlobal > 70 ? "text-warning" : "text-success"}`}>
            {tauxGlobal}%
          </span>
        </div>
        <div className="w-full bg-neutral rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${tauxGlobal > 100 ? "bg-danger" : tauxGlobal > 70 ? "bg-warning" : "bg-success"}`}
            style={{ width: `${Math.min(tauxGlobal, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-tertiary">{totalDepense.toLocaleString()} € dépensés</span>
          <span className="text-xs text-tertiary">{totalAlloue.toLocaleString()} € alloués</span>
        </div>
      </div>

      {/* Liste budgets */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
            Détail par catégorie
          </h3>
        </div>
        <div className="divide-y divide-border">
          {budgets.map((b) => {
            const pct = Math.min((b.spent / b.allocated) * 100, 100);
            const over = b.spent > b.allocated;
            const overAmount = b.spent - b.allocated;

            return (
              <div key={b.id} className="px-5 py-4 hover:bg-neutral/50 transition-colors">
                <div className="flex items-center gap-4">

                  {/* Icône */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ background: `${b.colorHex}15` }}>
                    {b.icon}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-primary">{b.category}</p>
                        {over && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-danger bg-danger/10 px-2 py-0.5 rounded-lg">
                            <AlertTriangle size={10} />
                            +{overAmount.toFixed(0)} €
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${over ? "text-danger" : "text-primary"}`}>
                          {b.spent.toFixed(0)} €
                        </span>
                        <span className="text-xs text-tertiary">/ {b.allocated.toFixed(0)} €</span>
                      </div>
                    </div>

                    {/* Barre */}
                    <div className="w-full bg-neutral rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: over ? "#EF4444" : b.colorHex,
                        }}
                      />
                    </div>

                    <div className="flex justify-between mt-1.5">
                      <span className="text-xs text-tertiary">{pct.toFixed(0)}% utilisé</span>
                      <span className={`text-xs font-medium ${over ? "text-danger" : "text-success"}`}>
                        {over ? "Dépassé" : `${(b.allocated - b.spent).toFixed(0)} € restant`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
                Nouveau budget
              </h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-neutral flex items-center justify-center text-tertiary hover:text-primary transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Catégorie</label>
                <select className="w-full border border-border rounded-lg px-4 py-3 text-sm text-primary outline-none focus:border-secondary transition-colors bg-white">
                  {["Alimentation", "Logement", "Transport", "Loisirs", "Abonnements", "Santé", "Autre"].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Plafond mensuel (€)</label>
                <input type="number" placeholder="0" className="w-full border border-border rounded-lg px-4 py-3 text-sm text-primary outline-none focus:border-secondary transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Alerte à (%)</label>
                <input type="number" placeholder="80" className="w-full border border-border rounded-lg px-4 py-3 text-sm text-primary outline-none focus:border-secondary transition-colors" />
                <p className="text-xs text-tertiary mt-1">Vous serez alerté quand ce seuil est atteint</p>
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