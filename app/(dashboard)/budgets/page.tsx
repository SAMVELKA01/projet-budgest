"use client";

import { useState, useEffect } from "react";
import { Plus, X, TrendingUp, TrendingDown, Wallet, AlertTriangle } from "lucide-react";
import { apiPost, apiDelete } from "@/lib/hooks/useApi";

interface Budget {
  _id: string;
  category: string;
  allocated: number;
  mois: number;
  annee: number;
  alertAt: number;
}

interface BudgetWithSpent extends Budget {
  spent: number;
  icon: string;
  colorHex: string;
}

const categoryMeta: Record<string, { icon: string; colorHex: string }> = {
  Alimentation: { icon: "🛒", colorHex: "#10B981" },
  Logement: { icon: "🏠", colorHex: "#3B82F6" },
  Transport: { icon: "🚗", colorHex: "#F59E0B" },
  Loisirs: { icon: "🎮", colorHex: "#8B5CF6" },
  Abonnements: { icon: "📱", colorHex: "#EC4899" },
  Santé: { icon: "💊", colorHex: "#64748B" },
  Autre: { icon: "📦", colorHex: "#94A3B8" },
};

const categories = ["Alimentation", "Logement", "Transport", "Loisirs", "Abonnements", "Santé", "Autre"];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetWithSpent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ category: "Alimentation", allocated: "", alertAt: "80" });

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const [budgetsRes, transactionsRes] = await Promise.all([
        fetch("/api/budgets"),
        fetch("/api/transactions?type=depense"),
      ]);
      const budgetsData: Budget[] = await budgetsRes.json();
      const transactions = await transactionsRes.json();

      const enriched: BudgetWithSpent[] = (Array.isArray(budgetsData) ? budgetsData : []).map(b => {
        const spent = Array.isArray(transactions)
          ? transactions
            .filter((t: any) => t.category === b.category)
            .reduce((s: number, t: any) => s + Math.abs(t.amount), 0)
          : 0;
        const meta = categoryMeta[b.category] || { icon: "📦", colorHex: "#94A3B8" };
        return { ...b, spent, ...meta };
      });

      setBudgets(enriched);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBudgets(); }, []);

  const handleAdd = async () => {
    if (!form.category || !form.allocated) return;
    setSaving(true);
    try {
      await apiPost("/api/budgets", {
        category: form.category,
        allocated: parseFloat(form.allocated),
        alertAt: parseInt(form.alertAt),
      });
      setShowModal(false);
      setForm({ category: "Alimentation", allocated: "", alertAt: "80" });
      fetchBudgets();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce budget ?")) return;
    await apiDelete(`/api/budgets/${id}`);
    fetchBudgets();
  };

  const totalAlloue = budgets.reduce((s, b) => s + b.allocated, 0);
  const totalDepense = budgets.reduce((s, b) => s + b.spent, 0);
  const reste = totalAlloue - totalDepense;
  const tauxGlobal = totalAlloue > 0 ? Math.round((totalDepense / totalAlloue) * 100) : 0;
  const budgetsOver = budgets.filter(b => b.spent > b.allocated).length;

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>Budgets</h1>
          <p className="text-tertiary text-sm mt-1">Suivez vos plafonds de dépenses par catégorie.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Nouveau budget
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total alloué", value: `${totalAlloue.toLocaleString()} €`, sub: `${budgets.length} catégories`, icon: Wallet, iconColor: "text-secondary", iconBg: "bg-secondary/10" },
          { label: "Total dépensé", value: `${totalDepense.toFixed(0)} €`, sub: `${tauxGlobal}% utilisé`, icon: TrendingDown, iconColor: "text-danger", iconBg: "bg-danger/10" },
          { label: "Reste disponible", value: `${reste.toFixed(0)} €`, sub: reste >= 0 ? "Dans le budget" : "Dépassement global", icon: TrendingUp, iconColor: "text-success", iconBg: "bg-success/10" },
          { label: "Alertes", value: `${budgetsOver}`, sub: budgetsOver === 0 ? "Aucun dépassement" : `${budgetsOver} dépassement${budgetsOver > 1 ? "s" : ""}`, icon: AlertTriangle, iconColor: "text-warning", iconBg: "bg-warning/10" },
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
          <span className="text-xs text-tertiary">{totalDepense.toFixed(0)} € dépensés</span>
          <span className="text-xs text-tertiary">{totalAlloue.toLocaleString()} € alloués</span>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-tertiary">Chargement...</p>
        </div>
      ) : budgets.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl py-12 text-center">
          <p className="text-sm text-tertiary">Aucun budget créé pour ce mois.</p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>Détail par catégorie</h3>
          </div>
          <div className="divide-y divide-border">
            {budgets.map((b) => {
              const pct = Math.min((b.spent / b.allocated) * 100, 100);
              const over = b.spent > b.allocated;
              return (
                <div key={b._id} className="px-5 py-4 hover:bg-neutral/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: `${b.colorHex}15` }}>
                      {b.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-primary">{b.category}</p>
                          {over && (
                            <span className="flex items-center gap-1 text-xs font-semibold text-danger bg-danger/10 px-2 py-0.5 rounded-lg">
                              <AlertTriangle size={10} /> +{(b.spent - b.allocated).toFixed(0)} €
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-bold ${over ? "text-danger" : "text-primary"}`}>
                            {b.spent.toFixed(0)} €
                          </span>
                          <span className="text-xs text-tertiary">/ {b.allocated.toFixed(0)} €</span>
                          <button
                            onClick={() => handleDelete(b._id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-tertiary hover:text-danger hover:bg-danger/10 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="w-full bg-neutral rounded-full h-2">
                        <div className="h-2 rounded-full transition-all"
                          style={{ width: `${pct}%`, background: over ? "#EF4444" : b.colorHex }} />
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
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>Nouveau budget</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-neutral flex items-center justify-center text-tertiary hover:text-primary transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Catégorie</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-secondary transition-colors bg-white"
                >
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Plafond mensuel (€)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.allocated}
                  onChange={(e) => setForm(f => ({ ...f, allocated: e.target.value }))}
                  className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-secondary transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Alerte à (%)</label>
                <input
                  type="number"
                  placeholder="80"
                  value={form.alertAt}
                  onChange={(e) => setForm(f => ({ ...f, alertAt: e.target.value }))}
                  className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-secondary transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-border text-tertiary py-3 rounded-xl text-sm font-semibold hover:bg-neutral transition-colors">
                Annuler
              </button>
              <button onClick={handleAdd} disabled={saving} className="flex-1 bg-primary text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors disabled:opacity-60">
                {saving ? "Création..." : "Créer →"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}