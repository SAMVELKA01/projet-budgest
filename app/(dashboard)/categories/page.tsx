"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { apiPost, apiPut, apiDelete } from "@/lib/hooks/useApi";

interface Categorie {
  _id: string;
  name: string;
  icon: string;
  colorHex: string;
  budget: number;
}

const colors = ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899", "#EF4444", "#64748B", "#06B6D4", "#0B1F3A", "#F97316"];
const icons = ["🛒", "🏠", "🚗", "🎮", "📱", "💊", "💰", "🏦", "✈️", "🎓", "🍽️", "👔", "🐾", "🎵", "🏋️"];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Categorie | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", icon: "🛒", colorHex: "#10B981", budget: "" });

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

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => {
    setEditingCat(null);
    setForm({ name: "", icon: "🛒", colorHex: "#10B981", budget: "" });
    setShowModal(true);
  };

  const openEdit = (cat: Categorie) => {
    setEditingCat(cat);
    setForm({ name: cat.name, icon: cat.icon, colorHex: cat.colorHex, budget: String(cat.budget) });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editingCat) {
        await apiPut(`/api/categories/${editingCat._id}`, { ...form, budget: Number(form.budget) });
      } else {
        await apiPost("/api/categories", { ...form, budget: Number(form.budget) });
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await apiDelete(`/api/categories/${id}`);
    setDeleteId(null);
    fetchCategories();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>Catégories</h1>
          <p className="text-tertiary text-sm mt-1">Gérez vos catégories de dépenses et revenus.</p>
        </div>
        <button onClick={openCreate} className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors flex items-center gap-2">
          <Plus size={16} /> Nouvelle catégorie
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total catégories", value: `${categories.length}`, color: "text-primary" },
          { label: "Budget total alloué", value: `${categories.reduce((s, c) => s + c.budget, 0).toLocaleString()} €`, color: "text-secondary" },
          { label: "Avec budget défini", value: `${categories.filter(c => c.budget > 0).length}`, color: "text-success" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-border rounded-2xl p-5">
            <p className="text-xs font-semibold text-tertiary uppercase tracking-wide mb-2">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.color}`} style={{ fontFamily: "var(--font-heading)" }}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-tertiary">Chargement...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl py-12 text-center">
          <p className="text-sm text-tertiary mb-2">Aucune catégorie créée.</p>
          <button onClick={openCreate} className="text-xs text-secondary font-semibold hover:underline">Créer une catégorie →</button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="bg-white border border-border rounded-2xl p-5 hover:border-secondary/40 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: `${cat.colorHex}18` }}>{cat.icon}</div>
                  <div>
                    <p className="text-sm font-bold text-primary">{cat.name}</p>
                    {cat.budget > 0 && <p className="text-xs text-tertiary">Budget : {cat.budget} €/mois</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cat)} className="w-7 h-7 rounded-lg bg-neutral border border-border flex items-center justify-center text-tertiary hover:text-primary hover:bg-neutral-dark transition-colors text-xs">✏</button>
                  <button onClick={() => setDeleteId(cat._id)} className="w-7 h-7 rounded-lg bg-neutral border border-border flex items-center justify-center text-tertiary hover:text-danger hover:bg-danger/10 transition-colors">
                    <X size={12} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: cat.colorHex }} />
                <span className="text-xs text-tertiary">Couleur assignée</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
                {editingCat ? "Modifier la catégorie" : "Nouvelle catégorie"}
              </h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-neutral flex items-center justify-center text-tertiary hover:text-primary transition-colors"><X size={16} /></button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Nom</label>
                <input type="text" placeholder="Ex: Alimentation" value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-secondary transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Icône</label>
                <div className="grid grid-cols-8 gap-2">
                  {icons.map((icon) => (
                    <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-colors ${form.icon === icon ? "bg-secondary/20 border-2 border-secondary" : "bg-neutral border border-border hover:bg-neutral-dark"}`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Couleur</label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((color) => (
                    <button key={color} onClick={() => setForm(f => ({ ...f, colorHex: color }))}
                      className="w-8 h-8 rounded-full transition-all"
                      style={{ background: color, outline: form.colorHex === color ? `3px solid ${color}` : "none", outlineOffset: "2px" }} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Budget mensuel (€) <span className="text-tertiary normal-case font-normal">— optionnel</span></label>
                <input type="number" placeholder="0" value={form.budget}
                  onChange={(e) => setForm(f => ({ ...f, budget: e.target.value }))}
                  className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-secondary transition-colors" />
              </div>
              <div className="bg-neutral rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${form.colorHex}18` }}>{form.icon}</div>
                <div>
                  <p className="text-sm font-bold text-primary">{form.name || "Nom de la catégorie"}</p>
                  <p className="text-xs text-tertiary">Aperçu</p>
                </div>
                <div className="ml-auto w-3 h-3 rounded-full" style={{ background: form.colorHex }} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-border text-tertiary py-3 rounded-xl text-sm font-semibold hover:bg-neutral transition-colors">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-primary text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors disabled:opacity-60">
                {saving ? "Sauvegarde..." : editingCat ? "Modifier →" : "Créer →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-primary mb-2" style={{ fontFamily: "var(--font-heading)" }}>Supprimer la catégorie ?</h2>
            <p className="text-sm text-tertiary mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-border text-tertiary py-3 rounded-xl text-sm font-semibold hover:bg-neutral transition-colors">Annuler</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-danger text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}