"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertTriangle,
  Pencil,
  Sparkles,
  PieChart,
} from "lucide-react";
import { apiPost, apiPut, apiDelete } from "@/lib/hooks/useApi";
import ConfirmModal from "@/components/ui/ConfirmModal";
import ToastContainer from "@/components/ui/Toast";
import { useToast } from "@/lib/hooks/useToast";
import { useDevise } from "@/lib/context/DeviseContext";

interface Budget {
  _id: string;
  categorieId: string;
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

interface Categorie {
  _id: string;
  name: string;
  icon: string;
  colorHex: string;
}

interface DepenseTransaction {
  categorieId: string;
  amount: number;
}

const pastelRotation = ["bg-pastel-sand", "bg-pastel-sage", "bg-pastel-mauve", "bg-pastel-olive"];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetWithSpent[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingBudget, setEditingBudget] = useState<BudgetWithSpent | null>(null);
  const [form, setForm] = useState({ categorieId: "", allocated: "", alertAt: "80" });
  const { toasts, toast, remove } = useToast();
  const { format, symbol } = useDevise();

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    setCategories(list);
    return list as Categorie[];
  };

  const fetchBudgets = async (catsOverride?: Categorie[]) => {
    setLoading(true);
    try {
      const cats = catsOverride || categories;
      const [budgetsRes, transactionsRes] = await Promise.all([
        fetch("/api/budgets"),
        fetch("/api/transactions?type=depense&limit=1000"),
      ]);
      const budgetsData: Budget[] = await budgetsRes.json();
      const transactions = await transactionsRes.json();
      const enriched: BudgetWithSpent[] = (Array.isArray(budgetsData) ? budgetsData : []).map((b) => {
        const spent = Array.isArray(transactions)
          ? (transactions as DepenseTransaction[]).filter((t) => t.categorieId === b.categorieId).reduce((s, t) => s + Math.abs(t.amount), 0)
          : 0;
        const cat = cats.find((c) => c._id === b.categorieId);
        const meta = { icon: cat?.icon || "📦", colorHex: cat?.colorHex || "#9A9CA5" };
        return { ...b, spent, ...meta };
      });
      setBudgets(enriched);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Chargement initial volontaire une seule fois au montage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories().then((cats) => fetchBudgets(cats));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingBudget(null);
    setForm({ categorieId: categories[0]?._id || "", allocated: "", alertAt: "80" });
    setShowModal(true);
  };

  const openEdit = (b: BudgetWithSpent) => {
    setEditingBudget(b);
    setForm({ categorieId: b.categorieId, allocated: String(b.allocated), alertAt: String(b.alertAt) });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.allocated) {
      toast("Veuillez entrer un montant", "error");
      return;
    }
    setSaving(true);
    try {
      if (editingBudget) {
        await apiPut(`/api/budgets/${editingBudget._id}`, { allocated: parseFloat(form.allocated), alertAt: parseInt(form.alertAt) });
        toast("Budget modifié avec succès !", "success");
      } else {
        await apiPost("/api/budgets", { categorieId: form.categorieId, allocated: parseFloat(form.allocated), alertAt: parseInt(form.alertAt) });
        toast("Budget créé avec succès !", "success");
      }
      setShowModal(false);
      fetchBudgets();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erreur", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await apiDelete(`/api/budgets/${deleteId}`);
      setDeleteId(null);
      toast("Budget supprimé", "success");
      fetchBudgets();
    } catch {
      toast("Erreur lors de la suppression", "error");
    }
  };

  const totalAlloue = budgets.reduce((s, b) => s + b.allocated, 0);
  const totalDepense = budgets.reduce((s, b) => s + b.spent, 0);
  const reste = totalAlloue - totalDepense;
  const tauxGlobal = totalAlloue > 0 ? Math.round((totalDepense / totalAlloue) * 100) : 0;
  const budgetsOver = budgets.filter((b) => b.spent > b.allocated).length;
  const pireCategorie = [...budgets].sort((a, b) => (b.spent / b.allocated) - (a.spent / a.allocated))[0];

  return (
    <div className="flex flex-col gap-6">
      <ToastContainer toasts={toasts} onRemove={remove} />
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-semibold text-primary" style={{ fontFamily: "var(--font-heading)" }}>Budgets</h1>
          <p className="text-tertiary text-sm mt-1">Suivez vos plafonds de dépenses par catégorie.</p>
        </div>
        <button onClick={openCreate} className="bg-gold text-ink px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
          <Plus size={16} /> Nouveau budget
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total alloué", value: format(totalAlloue), sub: `${budgets.length} catégories`, icon: Wallet, bg: "bg-pastel-sand" },
          { label: "Total dépensé", value: format(totalDepense), sub: `${tauxGlobal}% utilisé`, icon: TrendingDown, bg: "bg-pastel-mauve" },
          { label: "Reste disponible", value: format(reste), sub: reste >= 0 ? "Dans le budget" : "Dépassement", icon: TrendingUp, bg: "bg-pastel-sage" },
          { label: "Alertes", value: `${budgetsOver}`, sub: budgetsOver === 0 ? "Aucun dépassement" : `${budgetsOver} dépassement${budgetsOver > 1 ? "s" : ""}`, icon: AlertTriangle, bg: "bg-pastel-olive" },
        ].map((kpi) => (
          <div key={kpi.label} className={`${kpi.bg} rounded-2xl p-6`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-medium text-ink/60 uppercase tracking-wider">{kpi.label}</p>
              <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center">
                <kpi.icon size={15} className="text-ink" />
              </div>
            </div>
            <p className="text-3xl font-bold text-ink tabular-nums">{kpi.value}</p>
            <p className="text-xs text-ink/50 mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Barre globale */}
      <div className="bg-white border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-ink">Utilisation globale du budget</p>
          <span className={`text-lg font-bold tabular-nums ${tauxGlobal > 90 ? "text-danger" : tauxGlobal > 70 ? "text-warning" : "text-success"}`}>{tauxGlobal}%</span>
        </div>
        <div className="w-full bg-neutral rounded-full h-3">
          <div className={`h-3 rounded-full transition-all ${tauxGlobal > 100 ? "bg-danger" : tauxGlobal > 70 ? "bg-warning" : "bg-success"}`} style={{ width: `${Math.min(tauxGlobal, 100)}%` }} />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-tertiary">{format(totalDepense)} dépensés</span>
          <span className="text-xs text-tertiary">{format(totalAlloue)} alloués</span>
        </div>
      </div>

      {/* Recommandation IA */}
      {pireCategorie && pireCategorie.spent / pireCategorie.allocated > 0.8 && (
        <div className="bg-pastel-mauve rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-ink" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="inline-block text-[10px] font-bold text-ink/50 uppercase tracking-wider mb-1">Généré par l&apos;IA</span>
            <p className="text-sm text-ink">
              Votre budget <strong>{pireCategorie.icon} {pireCategorie.category}</strong> est utilisé à{" "}
              <strong>{Math.round((pireCategorie.spent / pireCategorie.allocated) * 100)}%</strong>. Envisagez de réduire vos dépenses dans cette catégorie
              ou d&apos;augmenter le plafond alloué pour le mois prochain.
            </p>
          </div>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="w-6 h-6 border-2 border-ink border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl py-14 text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-pastel-sand flex items-center justify-center">
            <PieChart size={24} className="text-ink" />
          </div>
          <p className="text-sm text-tertiary">Aucun budget créé pour ce mois.</p>
          <button onClick={openCreate} className="inline-flex items-center gap-1.5 text-xs text-ink bg-gold font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
            <Plus size={12} /> Créer mon premier budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b, i) => {
            const pct = Math.min((b.spent / b.allocated) * 100, 100);
            const over = b.spent > b.allocated;
            return (
              <div key={b._id} className={`${pastelRotation[i % pastelRotation.length]} rounded-2xl p-5`}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center text-lg shrink-0">{b.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-ink">{b.category}</p>
                        {over && (
                          <span className="flex items-center gap-1 text-xs font-semibold bg-badge-neg-bg text-badge-neg-text px-2 py-0.5 rounded-full">
                            <AlertTriangle size={10} /> +{format(b.spent - b.allocated)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => openEdit(b)} className="w-7 h-7 rounded-lg flex items-center justify-center text-ink/50 hover:text-ink hover:bg-white/60 transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setDeleteId(b._id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-ink/50 hover:text-danger hover:bg-white/60 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-lg font-bold tabular-nums ${over ? "text-danger" : "text-ink"}`}>{format(b.spent)}</span>
                      <span className="text-xs text-ink/50 tabular-nums">/ {format(b.allocated)}</span>
                    </div>

                    <div className="w-full bg-white/50 rounded-full h-2">
                      <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: over ? "#E15B5B" : pct > 80 ? "#E8A33D" : "#1E5C34" }} />
                    </div>

                    <div className="flex justify-between mt-1.5">
                      <span className="text-xs text-ink/50">{pct.toFixed(0)}% utilisé</span>
                      <span className={`text-xs font-medium ${over ? "text-danger" : "text-ink/70"}`}>
                        {over ? "Dépassé" : `${format(b.allocated - b.spent)} restant`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal créer/modifier */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-pastel-sage flex items-center justify-center shrink-0">
                <PieChart size={18} className="text-ink" />
              </div>
              <h2 className="text-lg font-semibold text-ink flex-1" style={{ fontFamily: "var(--font-heading)" }}>
                {editingBudget ? "Modifier le budget" : "Nouveau budget"}
              </h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-neutral flex items-center justify-center text-tertiary hover:text-ink transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {!editingBudget && (
                <div>
                  <label className="text-[11px] font-semibold text-tertiary uppercase tracking-wide mb-2 block">Catégorie</label>
                  {categories.length === 0 ? (
                    <p className="text-xs text-tertiary">
                      Aucune catégorie disponible. <a href="/categories" className="text-ink font-semibold hover:underline">Crée-en une d&apos;abord →</a>
                    </p>
                  ) : (
                    <select value={form.categorieId} onChange={(e) => setForm((f) => ({ ...f, categorieId: e.target.value }))}
                      className="w-full bg-neutral rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold transition-all">
                      {categories.map((c) => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
                    </select>
                  )}
                </div>
              )}
              <div>
                <label className="text-[11px] font-semibold text-tertiary uppercase tracking-wide mb-2 block">Plafond mensuel ({symbol})</label>
                <input type="number" placeholder="0" value={form.allocated} onChange={(e) => setForm((f) => ({ ...f, allocated: e.target.value }))}
                  className="w-full bg-neutral rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold transition-all" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-tertiary uppercase tracking-wide mb-2 block">Alerte à (%)</label>
                <input type="number" placeholder="80" value={form.alertAt} onChange={(e) => setForm((f) => ({ ...f, alertAt: e.target.value }))}
                  className="w-full bg-neutral rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold transition-all" />
              </div>
              {form.allocated && (
                <div className="bg-neutral rounded-xl p-4">
                  <p className="text-[11px] font-semibold text-tertiary uppercase tracking-wide mb-2">Aperçu</p>
                  <div className="w-full bg-white rounded-full h-2 mb-2">
                    <div className="h-2 rounded-full bg-success" style={{ width: "0%" }} />
                  </div>
                  <p className="text-xs text-tertiary">0 {symbol} dépensé sur {form.allocated} {symbol}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-border text-tertiary py-3 rounded-xl text-sm font-semibold hover:bg-neutral transition-colors">
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-ink text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
                {saving ? "Sauvegarde..." : editingBudget ? "Modifier →" : "Créer →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm suppression */}
      {deleteId && (
        <ConfirmModal
          title="Supprimer le budget ?"
          message="Cette action est irréversible. Le budget sera définitivement supprimé."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
