"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { apiPost, apiDelete } from "@/lib/hooks/useApi";
import ConfirmModal from "@/components/ui/ConfirmModal";
import ToastContainer from "@/components/ui/Toast";
import { useToast } from "@/lib/hooks/useToast";
import { useDevise } from "@/lib/context/DeviseContext";

interface Transaction {
  _id: string;
  name: string;
  category: string;
  categorieId: string;
  date: string;
  method: string;
  amount: number;
  type: string;
}
interface Categorie {
  _id: string;
  name: string;
  icon: string;
  colorHex: string;
}

const NEW_CATEGORY_VALUE = "__new__";
const quickCreatePalette = ["#5B8DEF", "#4CAF7D", "#E8A33D", "#E15B5B", "#8B7CF6", "#14B8A6", "#EC4899", "#F97316"];

const types = ["Type : Tout", "Dépenses", "Revenus"];
const ITEMS_PER_PAGE = 8;

export default function TransactionsPage() {
  const { toasts, toast, remove } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [categorieId, setCategorieId] = useState("");
  const [type, setType] = useState("Type : Tout");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    type: "depense",
    categorieId: "",
    method: "Carte Débit",
    date: "",
  });
  const { format, symbol } = useDevise();

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    setCategories(list);
    return list as Categorie[];
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categorieId) params.set("categorieId", categorieId);
      if (type === "Revenus") params.set("type", "revenu");
      if (type === "Dépenses") params.set("type", "depense");
      const res = await fetch(`/api/transactions?${params}`);
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Chargement initial volontaire une seule fois au montage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, []);

  useEffect(() => {
    // Rechargement volontaire à chaque changement de filtre.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorieId, type]);

  const openModal = () => {
    setForm({
      name: "",
      amount: "",
      type: "depense",
      categorieId: categories[0]?._id || "",
      method: "Carte Débit",
      date: "",
    });
    setNewCatName("");
    setShowModal(true);
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) {
      toast("Nom de catégorie requis", "error");
      return;
    }
    setCreatingCat(true);
    try {
      const color = quickCreatePalette[categories.length % quickCreatePalette.length];
      const created = await apiPost("/api/categories", { name: newCatName.trim(), colorHex: color });
      const updated = await fetchCategories();
      const match = updated.find((c) => c._id === created._id) || created;
      setForm((f) => ({ ...f, categorieId: match._id }));
      setNewCatName("");
      toast("Catégorie créée", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erreur lors de la création", "error");
    } finally {
      setCreatingCat(false);
    }
  };

  const handleAdd = async () => {
    if (!form.name || !form.amount || !form.categorieId) {
      toast("Veuillez remplir tous les champs", "error");
      return;
    }
    setSaving(true);
    try {
      await apiPost("/api/transactions", {
        ...form,
        amount: parseFloat(form.amount),
        date: form.date || new Date().toISOString(),
      });
      setShowModal(false);
      toast("Transaction ajoutée avec succès !", "success");
      fetchTransactions();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erreur lors de l'ajout", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await apiDelete(`/api/transactions/${deleteId}`);
      setDeleteId(null);
      toast("Transaction supprimée", "success");
      fetchTransactions();
    } catch {
      toast("Erreur lors de la suppression", "error");
    }
  };

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const paginated = transactions.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );
  const totalDepenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalRevenus = transactions
    .filter((t) => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);
  const solde = totalRevenus - totalDepenses;

  return (
    <div className="flex flex-col gap-6">
      <ToastContainer toasts={toasts} onRemove={remove} />

      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-[28px] font-semibold text-primary"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Historique des Transactions
          </h1>
          <p className="text-tertiary text-sm mt-1">
            Gérez et analysez vos flux financiers avec précision.
          </p>
        </div>
        <button
          onClick={openModal}
          className="bg-primary text-inverse px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Ajouter une transaction
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Dépenses ce mois",
            value: format(totalDepenses),
            color: "text-danger",
          },
          {
            label: "Revenus ce mois",
            value: format(totalRevenus),
            color: "text-success",
          },
          {
            label: "Solde disponible",
            value: format(solde),
            color: "text-primary",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white border border-border rounded-2xl p-6"
          >
            <p className="text-[11px] font-medium text-tertiary uppercase tracking-wider mb-2">
              {kpi.label}
            </p>
            <p className={`text-3xl font-bold tabular-nums ${kpi.color}`}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <select
            value={categorieId}
            onChange={(e) => {
              setCategorieId(e.target.value);
              setPage(1);
            }}
            className="text-sm rounded-full px-4 py-2 text-primary bg-neutral outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="text-sm rounded-full px-4 py-2 text-primary bg-neutral outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
          >
            {types.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span className="text-xs text-tertiary ml-auto">
            {loading
              ? "Chargement..."
              : `${transactions.length} transaction${transactions.length > 1 ? "s" : ""}`}
          </span>
        </div>

        <div className="hidden md:grid grid-cols-6 gap-4 px-4 py-2 mb-1">
          {["DATE", "DESCRIPTION", "CATÉGORIE", "MÉTHODE", "MONTANT", ""].map(
            (h) => (
              <span
                key={h}
                className="text-xs font-semibold text-tertiary uppercase tracking-wide"
              >
                {h}
              </span>
            ),
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-tertiary">Chargement...</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-tertiary">Aucune transaction trouvée.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {paginated.map((t) => (
              <div
                key={t._id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-neutral transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-neutral border border-border flex items-center justify-center text-xs font-bold text-tertiary shrink-0">
                  {t.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">
                    {t.name}
                  </p>
                  <p className="text-xs text-tertiary">
                    {new Date(t.date).toLocaleDateString("fr-FR")} ·{" "}
                    {t.category}
                  </p>
                </div>
                <span
                  className={`text-sm font-bold shrink-0 ${t.amount > 0 ? "text-success" : "text-danger"}`}
                >
                  {t.amount > 0 ? "+" : ""}
                  {format(Math.abs(t.amount))}
                </span>
                <button
                  onClick={() => setDeleteId(t._id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-tertiary hover:text-danger hover:bg-danger/10 transition-colors shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-sm text-tertiary px-4 py-2 rounded-lg border border-border hover:bg-neutral transition-colors disabled:opacity-40"
            >
              ← Précédent
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${page === p ? "bg-primary text-inverse" : "text-tertiary hover:bg-neutral border border-border"}`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-sm text-tertiary px-4 py-2 rounded-lg border border-border hover:bg-neutral transition-colors disabled:opacity-40"
            >
              Suivant →
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2
                className="text-lg font-bold text-primary"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Nouvelle transaction
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg bg-neutral flex items-center justify-center text-tertiary hover:text-primary transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Ex: Supermarché"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full bg-neutral rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">
                    Montant ({symbol})
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, amount: e.target.value }))
                    }
                    className="w-full bg-neutral rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: e.target.value }))
                    }
                    className="w-full bg-neutral rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option value="depense">Dépense</option>
                    <option value="revenu">Revenu</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">
                  Catégorie
                </label>
                {categories.length === 0 ? (
                  <p className="text-xs text-tertiary mb-2">
                    Aucune catégorie pour l&apos;instant, crée la première ci-dessous.
                  </p>
                ) : (
                  <select
                    value={form.categorieId || NEW_CATEGORY_VALUE}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, categorieId: e.target.value === NEW_CATEGORY_VALUE ? "" : e.target.value }))
                    }
                    className="w-full bg-neutral rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                    <option value={NEW_CATEGORY_VALUE}>+ Nouvelle catégorie…</option>
                  </select>
                )}
                {(categories.length === 0 || !form.categorieId) && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Nom de la nouvelle catégorie"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="flex-1 bg-neutral rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={creatingCat}
                      className="px-4 py-2.5 rounded-lg bg-secondary text-inverse text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 shrink-0"
                    >
                      {creatingCat ? "…" : "Créer"}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">
                    Méthode
                  </label>
                  <select
                    value={form.method}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, method: e.target.value }))
                    }
                    className="w-full bg-neutral rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    {[
                      "Carte Débit",
                      "Carte Crédit",
                      "Virement SEPA",
                      "Prélèvement",
                      "Espèces",
                      "Apple Pay",
                    ].map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value }))
                    }
                    className="w-full bg-neutral rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-border text-tertiary py-3 rounded-xl text-sm font-semibold hover:bg-neutral transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAdd}
                disabled={saving}
                className="flex-1 bg-primary text-inverse py-3 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors disabled:opacity-60"
              >
                {saving ? "Ajout..." : "Ajouter →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <ConfirmModal
          title="Supprimer la transaction ?"
          message="Cette action est irréversible. La transaction sera définitivement supprimée."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
