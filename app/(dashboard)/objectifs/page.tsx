"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  X,
  Target,
  TrendingUp,
  Wallet,
  Trophy,
  Pencil,
  PiggyBank,
} from "lucide-react";
import { apiPost, apiPut, apiDelete } from "@/lib/hooks/useApi";
import ConfirmModal from "@/components/ui/ConfirmModal";
import ToastContainer from "@/components/ui/Toast";
import { useToast } from "@/lib/hooks/useToast";
import { useDevise } from "@/lib/context/DeviseContext";

interface Objectif {
  _id: string;
  title: string;
  emoji: string;
  target: number;
  saved: number;
  deadline: string;
  colorHex: string;
}

const emojis = ["🎯", "✈️", "💻", "🚗", "🏠", "🎓", "💍", "🏖️", "🛡️", "🏦"];
const colors = ["#5B8DEF", "#4CAF7D", "#E8A33D", "#E15B5B", "#8B7CF6", "#14B8A6", "#EC4899", "#F97316"];
const pastelRotation = ["bg-pastel-sand", "bg-pastel-sage", "bg-pastel-mauve", "bg-pastel-olive"];

function CircularProgress({ pct, colorHex }: { pct: number; colorHex: string }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="6" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={colorHex} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-ink">{pct.toFixed(0)}%</span>
      </div>
    </div>
  );
}

export default function ObjectifsPage() {
  const [now] = useState(() => Date.now());
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingObjectif, setEditingObjectif] = useState<Objectif | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState("");
  const [form, setForm] = useState({ title: "", emoji: "🎯", target: "", saved: "", deadline: "", colorHex: "#5B8DEF" });
  const { toasts, toast, remove } = useToast();
  const { format, symbol } = useDevise();

  const fetchObjectifs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/objectifs");
      const data = await res.json();
      setObjectifs(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Chargement initial volontaire une seule fois au montage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchObjectifs();
  }, []);

  const openCreate = () => {
    setEditingObjectif(null);
    setForm({ title: "", emoji: "🎯", target: "", saved: "", deadline: "", colorHex: "#5B8DEF" });
    setShowModal(true);
  };

  const openEdit = (o: Objectif) => {
    setEditingObjectif(o);
    setForm({ title: o.title, emoji: o.emoji, target: String(o.target), saved: String(o.saved), deadline: o.deadline.split("T")[0], colorHex: o.colorHex });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.target || !form.deadline) {
      toast("Veuillez remplir tous les champs", "error");
      return;
    }
    setSaving(true);
    try {
      if (editingObjectif) {
        await apiPut(`/api/objectifs/${editingObjectif._id}`, {
          title: form.title, emoji: form.emoji, target: parseFloat(form.target),
          saved: parseFloat(form.saved || "0"), deadline: form.deadline, colorHex: form.colorHex,
        });
        toast("Objectif modifié avec succès !", "success");
      } else {
        await apiPost("/api/objectifs", { ...form, target: parseFloat(form.target), saved: parseFloat(form.saved || "0") });
        toast("Objectif créé avec succès !", "success");
      }
      setShowModal(false);
      fetchObjectifs();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erreur", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddFunds = async (o: Objectif) => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      toast("Veuillez entrer un montant valide", "error");
      return;
    }
    try {
      await apiPut(`/api/objectifs/${o._id}`, { saved: o.saved + parseFloat(addAmount) });
      toast(`${format(parseFloat(addAmount))} ajoutés à "${o.title}"`, "success");
      setAddAmount("");
      setSelectedId(null);
      fetchObjectifs();
    } catch {
      toast("Erreur lors de l'ajout", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await apiDelete(`/api/objectifs/${deleteId}`);
      setDeleteId(null);
      toast("Objectif supprimé", "success");
      fetchObjectifs();
    } catch {
      toast("Erreur lors de la suppression", "error");
    }
  };

  const totalSaved = objectifs.reduce((s, o) => s + o.saved, 0);
  const totalTarget = objectifs.reduce((s, o) => s + o.target, 0);
  const completed = objectifs.filter((o) => o.saved >= o.target).length;
  const globalPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const getStatus = (o: Objectif) => {
    const pct = (o.saved / o.target) * 100;
    if (pct >= 100) return { label: "Complété", color: "text-badge-pos-text", bg: "bg-badge-pos-bg" };
    if (pct >= 75) return { label: "Presque", color: "text-info", bg: "bg-white/60" };
    if (pct >= 40) return { label: "En cours", color: "text-warning", bg: "bg-white/60" };
    return { label: "Débuté", color: "text-ink/60", bg: "bg-white/60" };
  };

  const joursRestants = (deadline: string) => {
    const diff = Math.ceil((new Date(deadline).getTime() - now) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "Échéance dépassée";
    if (diff === 0) return "Aujourd'hui";
    return `${diff} jour${diff > 1 ? "s" : ""} restant${diff > 1 ? "s" : ""}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <ToastContainer toasts={toasts} onRemove={remove} />
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-semibold text-primary" style={{ fontFamily: "var(--font-heading)" }}>Objectifs d&apos;épargne</h1>
          <p className="text-tertiary text-sm mt-1">Fixez des objectifs et atteignez l&apos;équilibre financier.</p>
        </div>
        <button onClick={openCreate} className="bg-gold text-ink px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
          <Plus size={16} /> Nouvel objectif
        </button>
      </div>

      {/* Card motivation */}
      {objectifs.length > 0 && (
        <div className="bg-ink rounded-2xl px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center shrink-0">
            <PiggyBank size={18} className="text-ink" />
          </div>
          <p className="text-sm text-white">
            Vous avez épargné <strong className="tabular-nums">{format(totalSaved)}</strong> vers vos objectifs, soit{" "}
            <strong className="tabular-nums">{globalPct}%</strong> de votre cible totale de <strong className="tabular-nums">{format(totalTarget)}</strong>.
          </p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Objectifs actifs", value: `${objectifs.length}`, sub: `${completed} complété${completed > 1 ? "s" : ""}`, icon: Target, bg: "bg-pastel-sand" },
          { label: "Total épargné", value: format(totalSaved), sub: `Sur ${format(totalTarget)} visés`, icon: Wallet, bg: "bg-pastel-sage" },
          { label: "Progression globale", value: `${globalPct}%`, sub: "Tous objectifs confondus", icon: TrendingUp, bg: "bg-pastel-mauve" },
          { label: "Complétés", value: `${completed}`, sub: `${objectifs.length - completed} en cours`, icon: Trophy, bg: "bg-pastel-olive" },
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

      {/* Cards */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="w-6 h-6 border-2 border-ink border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        </div>
      ) : objectifs.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl py-14 text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-pastel-sand flex items-center justify-center">
            <Target size={24} className="text-ink" />
          </div>
          <p className="text-sm text-tertiary">Aucun objectif créé pour le moment.</p>
          <button onClick={openCreate} className="inline-flex items-center gap-1.5 text-xs text-ink bg-gold font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
            <Plus size={12} /> Créer mon premier objectif
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {objectifs.map((o, i) => {
            const pct = Math.min((o.saved / o.target) * 100, 100);
            const status = getStatus(o);
            const isSelected = selectedId === o._id;
            return (
              <div key={o._id} onClick={() => setSelectedId(isSelected ? null : o._id)}
                className={`${pastelRotation[i % pastelRotation.length]} rounded-2xl p-5 cursor-pointer transition-all ${isSelected ? "ring-2 ring-ink/30" : ""}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CircularProgress pct={pct} colorHex={o.colorHex} />
                    <div>
                      <p className="text-sm font-bold text-ink flex items-center gap-1.5">
                        <span>{o.emoji}</span> {o.title}
                      </p>
                      <p className="text-xs text-ink/50 mt-0.5">{joursRestants(o.deadline)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.bg} ${status.color}`}>{status.label}</span>
                    <button onClick={(e) => { e.stopPropagation(); openEdit(o); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-ink/50 hover:text-ink hover:bg-white/60 transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteId(o._id); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-ink/50 hover:text-danger hover:bg-white/60 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-3">
                  <div>
                    <p className="text-xs text-ink/50 mb-1">Épargné</p>
                    <p className="text-xl font-bold text-ink tabular-nums">{format(o.saved)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-ink/50 mb-1">Objectif</p>
                    <p className="text-xl font-bold text-ink/50 tabular-nums">{format(o.target)}</p>
                  </div>
                </div>

                <div className="w-full bg-white/50 rounded-full h-2.5 mb-2">
                  <div className="h-2.5 rounded-full transition-all" style={{ width: `${pct}%`, background: o.colorHex }} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold" style={{ color: o.colorHex }}>{pct.toFixed(0)}%</span>
                  <span className="text-xs text-ink/50">
                    {o.saved >= o.target ? "Objectif atteint 🎉" : `${format(o.target - o.saved)} restant`}
                  </span>
                </div>

                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-border flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <input type="number" placeholder={`Montant à ajouter (${symbol})`} value={addAmount} onChange={(e) => setAddAmount(e.target.value)}
                      className="flex-1 bg-white/70 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ink/20 transition-all" />
                    <button onClick={() => handleAddFunds(o)} className="bg-ink text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                      Ajouter
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal créer/modifier */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-pastel-mauve flex items-center justify-center shrink-0">
                <Target size={18} className="text-ink" />
              </div>
              <h2 className="text-lg font-semibold text-ink flex-1" style={{ fontFamily: "var(--font-heading)" }}>
                {editingObjectif ? "Modifier l'objectif" : "Nouvel objectif"}
              </h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-neutral flex items-center justify-center text-tertiary hover:text-ink transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[11px] font-semibold text-tertiary uppercase tracking-wide mb-2 block">Nom de l&apos;objectif</label>
                <input type="text" placeholder="Ex: Vacances été" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full bg-neutral rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold transition-all" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-tertiary uppercase tracking-wide mb-2 block">Emoji</label>
                <div className="flex gap-2 flex-wrap">
                  {emojis.map((e) => (
                    <button key={e} onClick={() => setForm((f) => ({ ...f, emoji: e }))}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-colors ${form.emoji === e ? "bg-gold" : "bg-neutral border border-border"}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-tertiary uppercase tracking-wide mb-2 block">Couleur</label>
                <div className="flex gap-2">
                  {colors.map((c) => (
                    <button key={c} onClick={() => setForm((f) => ({ ...f, colorHex: c }))} className="w-8 h-8 rounded-full transition-all"
                      style={{ background: c, outline: form.colorHex === c ? `3px solid ${c}` : "none", outlineOffset: "2px" }} />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-tertiary uppercase tracking-wide mb-2 block">Montant visé ({symbol})</label>
                  <input type="number" placeholder="0" value={form.target} onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))}
                    className="w-full bg-neutral rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold transition-all" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-tertiary uppercase tracking-wide mb-2 block">Déjà épargné ({symbol})</label>
                  <input type="number" placeholder="0" value={form.saved} onChange={(e) => setForm((f) => ({ ...f, saved: e.target.value }))}
                    className="w-full bg-neutral rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold transition-all" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-tertiary uppercase tracking-wide mb-2 block">Échéance</label>
                <input type="date" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                  className="w-full bg-neutral rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold transition-all" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-border text-tertiary py-3 rounded-xl text-sm font-semibold hover:bg-neutral transition-colors">
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-ink text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
                {saving ? "Sauvegarde..." : editingObjectif ? "Modifier →" : "Créer →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm suppression */}
      {deleteId && (
        <ConfirmModal
          title="Supprimer l'objectif ?"
          message="Cette action est irréversible. L'objectif et sa progression seront définitivement supprimés."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
