"use client";

import { useState } from "react";

const defaultCategories = [
  { id: 1, name: "Alimentation", icon: "🛒", colorHex: "#10B981", transactions: 12, budget: 400 },
  { id: 2, name: "Logement", icon: "🏠", colorHex: "#3B82F6", transactions: 3, budget: 900 },
  { id: 3, name: "Transport", icon: "🚗", colorHex: "#F59E0B", transactions: 8, budget: 150 },
  { id: 4, name: "Loisirs", icon: "🎮", colorHex: "#8B5CF6", transactions: 5, budget: 200 },
  { id: 5, name: "Abonnements", icon: "📱", colorHex: "#EC4899", transactions: 4, budget: 50 },
  { id: 6, name: "Santé", icon: "💊", colorHex: "#64748B", transactions: 2, budget: 100 },
  { id: 7, name: "Revenus", icon: "💰", colorHex: "#0B1F3A", transactions: 2, budget: 0 },
  { id: 8, name: "Épargne", icon: "🏦", colorHex: "#06B6D4", transactions: 1, budget: 500 },
];

const colors = ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899", "#EF4444", "#64748B", "#06B6D4", "#0B1F3A", "#F97316"];
const icons = ["🛒", "🏠", "🚗", "🎮", "📱", "💊", "💰", "🏦", "✈️", "🎓", "🍽️", "👔", "🐾", "🎵", "🏋️"];

type Category = typeof defaultCategories[0];

export default function CategoriesPage() {
  const [categories, setCategories] = useState(defaultCategories);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", icon: "🛒", colorHex: "#10B981", budget: "" });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const openCreate = () => {
    setEditingCat(null);
    setForm({ name: "", icon: "🛒", colorHex: "#10B981", budget: "" });
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCat(cat);
    setForm({ name: cat.name, icon: cat.icon, colorHex: cat.colorHex, budget: String(cat.budget) });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingCat) {
      setCategories(prev => prev.map(c => c.id === editingCat.id
        ? { ...c, name: form.name, icon: form.icon, colorHex: form.colorHex, budget: Number(form.budget) }
        : c
      ));
    } else {
      setCategories(prev => [...prev, {
        id: Date.now(),
        name: form.name,
        icon: form.icon,
        colorHex: form.colorHex,
        budget: Number(form.budget),
        transactions: 0,
      }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setDeleteId(null);
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
            Catégories
          </h1>
          <p className="text-tertiary text-sm mt-1">Gérez vos catégories de dépenses et revenus.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors"
        >
          + Nouvelle catégorie
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total catégories", value: `${categories.length}`, color: "text-primary" },
          { label: "Budget total alloué", value: `${categories.reduce((s, c) => s + c.budget, 0).toLocaleString()} €`, color: "text-secondary" },
          { label: "Total transactions", value: `${categories.reduce((s, c) => s + c.transactions, 0)}`, color: "text-success" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-border rounded-2xl p-5">
            <p className="text-xs font-semibold text-tertiary uppercase tracking-wide mb-2">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.color}`} style={{ fontFamily: "var(--font-heading)" }}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Grid catégories */}
      <div className="grid grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white border border-border rounded-2xl p-5 hover:border-secondary/40 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: `${cat.colorHex}18` }}>
                  {cat.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">{cat.name}</p>
                  <p className="text-xs text-tertiary">{cat.transactions} transactions</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(cat)}
                  className="w-7 h-7 rounded-lg bg-neutral border border-border flex items-center justify-center text-tertiary hover:text-primary hover:bg-neutral-dark transition-colors text-xs"
                >
                  ✏
                </button>
                <button
                  onClick={() => setDeleteId(cat.id)}
                  className="w-7 h-7 rounded-lg bg-neutral border border-border flex items-center justify-center text-tertiary hover:text-danger hover:bg-danger/10 transition-colors text-xs"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Couleur + budget */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: cat.colorHex }} />
                <span className="text-xs text-tertiary">Couleur</span>
              </div>
              {cat.budget > 0 && (
                <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                  style={{ background: `${cat.colorHex}15`, color: cat.colorHex }}>
                  Budget : {cat.budget} €
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal créer/éditer */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
                {editingCat ? "Modifier la catégorie" : "Nouvelle catégorie"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-tertiary hover:text-primary text-xl">×</button>
            </div>

            <div className="flex flex-col gap-4">

              {/* Nom */}
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Nom</label>
                <input
                  type="text"
                  placeholder="Ex: Alimentation"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-border rounded-lg px-4 py-3 text-sm text-primary outline-none focus:border-secondary transition-colors"
                />
              </div>

              {/* Icône */}
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Icône</label>
                <div className="grid grid-cols-8 gap-2">
                  {icons.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setForm(f => ({ ...f, icon }))}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-colors ${
                        form.icon === icon ? "bg-secondary/20 border-2 border-secondary" : "bg-neutral border border-border hover:bg-neutral-dark"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Couleur */}
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Couleur</label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setForm(f => ({ ...f, colorHex: color }))}
                      className="w-8 h-8 rounded-full transition-all"
                      style={{
                        background: color,
                        outline: form.colorHex === color ? `3px solid ${color}` : "none",
                        outlineOffset: "2px",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">
                  Budget mensuel (€) <span className="text-tertiary normal-case font-normal">— optionnel</span>
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.budget}
                  onChange={(e) => setForm(f => ({ ...f, budget: e.target.value }))}
                  className="w-full border border-border rounded-lg px-4 py-3 text-sm text-primary outline-none focus:border-secondary transition-colors"
                />
              </div>

              {/* Aperçu */}
              <div className="bg-neutral rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: `${form.colorHex}18` }}>
                  {form.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">{form.name || "Nom de la catégorie"}</p>
                  <p className="text-xs text-tertiary">Aperçu de la catégorie</p>
                </div>
                <div className="ml-auto w-3 h-3 rounded-full" style={{ background: form.colorHex }} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-border text-tertiary py-3 rounded-xl text-sm font-semibold hover:bg-neutral transition-colors">
                Annuler
              </button>
              <button onClick={handleSave} className="flex-1 bg-primary text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors">
                {editingCat ? "Modifier →" : "Créer →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation suppression */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-primary mb-2" style={{ fontFamily: "var(--font-heading)" }}>
              Supprimer la catégorie ?
            </h2>
            <p className="text-sm text-tertiary mb-6">
              Cette action est irréversible. Les transactions liées ne seront pas supprimées.
            </p>
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