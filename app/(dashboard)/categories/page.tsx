"use client";

import { useState, useEffect } from "react";
import { Plus, X, Tag } from "lucide-react";
import { apiPost, apiPut, apiDelete } from "@/lib/hooks/useApi";
import ToastContainer from "@/components/ui/Toast";
import { useToast } from "@/lib/hooks/useToast";
import { useDevise } from "@/lib/context/DeviseContext";

interface Categorie {
  _id: string;
  name: string;
  icon: string;
  colorHex: string;
  budget: number;
}

const colors = ["#5B8DEF", "#4CAF7D", "#E8A33D", "#E15B5B", "#8B7CF6", "#14B8A6", "#EC4899", "#F97316", "#06B6D4", "#6366F1"];
const icons = ["🛒", "🏠", "🚗", "🎮", "📱", "💊", "💰", "🏦", "✈️", "🎓", "🍽️", "👔", "🐾", "🎵", "🏋️"];
const suggestions = [
  { name: "Alimentation", icon: "🛒", colorHex: "#5B8DEF" },
  { name: "Logement", icon: "🏠", colorHex: "#8B7CF6" },
  { name: "Transport", icon: "🚗", colorHex: "#E8A33D" },
  { name: "Loisirs", icon: "🎮", colorHex: "#EC4899" },
  { name: "Salaire", icon: "💰", colorHex: "#4CAF7D" },
];
const pastelRotation = ["bg-pastel-sand", "bg-pastel-sage", "bg-pastel-mauve", "bg-pastel-olive"];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Categorie | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", icon: "🛒", colorHex: "#5B8DEF", budget: "" });
  const { toasts, toast, remove } = useToast();
  const { format, symbol } = useDevise();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Chargement initial volontaire une seule fois au montage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, []);

  const openCreate = () => {
    setEditingCat(null);
    setForm({ name: "", icon: "🛒", colorHex: "#5B8DEF", budget: "" });
    setShowModal(true);
  };

  const openEdit = (cat: Categorie) => {
    setEditingCat(cat);
    setForm({ name: cat.name, icon: cat.icon, colorHex: cat.colorHex, budget: String(cat.budget) });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast("Le nom est requis", "error");
      return;
    }
    setSaving(true);
    try {
      if (editingCat) {
        await apiPut(`/api/categories/${editingCat._id}`, { ...form, budget: Number(form.budget) });
        toast("Catégorie modifiée avec succès !", "success");
      } else {
        await apiPost("/api/categories", { ...form, budget: Number(form.budget) });
        toast("Catégorie créée avec succès !", "success");
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erreur", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleQuickCreate = async (s: (typeof suggestions)[number]) => {
    try {
      await apiPost("/api/categories", { name: s.name, icon: s.icon, colorHex: s.colorHex, budget: 0 });
      toast(`Catégorie "${s.name}" créée`, "success");
      fetchCategories();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`/api/categories/${id}`);
      setDeleteId(null);
      toast("Catégorie supprimée", "success");
      fetchCategories();
    } catch {
      toast("Erreur lors de la suppression", "error");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <ToastContainer toasts={toasts} onRemove={remove} />
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-semibold text-primary" style={{ fontFamily: "var(--font-heading)" }}>Catégories</h1>
          <p className="text-tertiary text-sm mt-1">Gérez vos catégories de dépenses et revenus.</p>
        </div>
        <button onClick={openCreate} className="bg-gold text-ink px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
          <Plus size={16} /> Nouvelle catégorie
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total catégories", value: `${categories.length}`, bg: "bg-pastel-sand" },
          { label: "Budget total alloué", value: `${format(categories.reduce((s, c) => s + c.budget, 0))}`, bg: "bg-pastel-sage" },
          { label: "Avec budget défini", value: `${categories.filter((c) => c.budget > 0).length}`, bg: "bg-pastel-mauve" },
        ].map((kpi) => (
          <div key={kpi.label} className={`${kpi.bg} rounded-2xl p-6`}>
            <p className="text-[11px] font-medium text-ink/60 uppercase tracking-wider mb-2">{kpi.label}</p>
            <p className="text-3xl font-bold text-ink tabular-nums">{kpi.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="w-6 h-6 border-2 border-ink border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-tertiary">Chargement...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl py-10 px-6 text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-pastel-sand flex items-center justify-center">
            <Tag size={24} className="text-ink" />
          </div>
          <div>
            <p className="text-sm text-tertiary mb-3">Aucune catégorie créée. Démarrez avec une suggestion :</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button key={s.name} onClick={() => handleQuickCreate(s)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink bg-neutral px-3 py-1.5 rounded-full hover:bg-neutral-dark transition-colors">
                  {s.icon} {s.name}
                </button>
              ))}
            </div>
          </div>
          <button onClick={openCreate} className="text-xs text-ink font-semibold hover:underline">ou créer une catégorie personnalisée →</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <div key={cat._id} className={`${pastelRotation[i % pastelRotation.length]} rounded-2xl p-5`}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-full bg-white/60 flex items-center justify-center text-xl shrink-0">{cat.icon}</div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cat)} className="w-7 h-7 rounded-lg flex items-center justify-center text-ink/50 hover:text-ink hover:bg-white/60 transition-colors text-xs">✏</button>
                  <button onClick={() => setDeleteId(cat._id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-ink/50 hover:text-danger hover:bg-white/60 transition-colors">
                    <X size={12} />
                  </button>
                </div>
              </div>
              <p className="text-sm font-bold text-ink mb-1">{cat.name}</p>
              {cat.budget > 0 ? (
                <p className="text-xs text-ink/60 tabular-nums">Budget : {format(cat.budget)} {symbol}</p>
              ) : (
                <p className="text-xs text-ink/40">Pas de budget défini</p>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-pastel-olive flex items-center justify-center shrink-0">
                <Tag size={18} className="text-ink" />
              </div>
              <h2 className="text-lg font-semibold text-ink flex-1" style={{ fontFamily: "var(--font-heading)" }}>
                {editingCat ? "Modifier la catégorie" : "Nouvelle catégorie"}
              </h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-neutral flex items-center justify-center text-tertiary hover:text-ink transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[11px] font-semibold text-tertiary uppercase tracking-wide mb-2 block">Nom</label>
                <input type="text" placeholder="Ex: Alimentation" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-neutral rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold transition-all" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-tertiary uppercase tracking-wide mb-2 block">Icône</label>
                <div className="grid grid-cols-8 gap-2">
                  {icons.map((icon) => (
                    <button key={icon} onClick={() => setForm((f) => ({ ...f, icon }))}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-colors ${form.icon === icon ? "bg-gold" : "bg-neutral border border-border hover:bg-neutral-dark"}`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-tertiary uppercase tracking-wide mb-2 block">Couleur</label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((color) => (
                    <button key={color} onClick={() => setForm((f) => ({ ...f, colorHex: color }))} className="w-8 h-8 rounded-full transition-all"
                      style={{ background: color, outline: form.colorHex === color ? `3px solid ${color}` : "none", outlineOffset: "2px" }} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-tertiary uppercase tracking-wide mb-2 block">Budget mensuel (optionnel)</label>
                <input type="number" placeholder="0" value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                  className="w-full bg-neutral rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold transition-all" />
              </div>
              <div className="bg-neutral rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl">{form.icon}</div>
                <div>
                  <p className="text-sm font-bold text-ink">{form.name || "Nom de la catégorie"}</p>
                  <p className="text-xs text-tertiary">Aperçu</p>
                </div>
                <div className="ml-auto w-3 h-3 rounded-full" style={{ background: form.colorHex }} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-border text-tertiary py-3 rounded-xl text-sm font-semibold hover:bg-neutral transition-colors">
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-ink text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
                {saving ? "Sauvegarde..." : editingCat ? "Modifier →" : "Créer →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-ink mb-2" style={{ fontFamily: "var(--font-heading)" }}>Supprimer la catégorie ?</h2>
            <p className="text-sm text-tertiary mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-border text-tertiary py-3 rounded-xl text-sm font-semibold hover:bg-neutral transition-colors">
                Annuler
              </button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-danger text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
