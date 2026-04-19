"use client";

import { useState } from "react";

const allTransactions = [
  { name: "Supermarché Casino", category: "Alimentation", date: "24 Oct 2024", method: "Visa •••• 4242", amount: -88.2 },
  { name: "Virement Salaire", category: "Revenus", date: "23 Oct 2024", method: "Virement SEPA", amount: 3280.0 },
  { name: "EDF Électricité", category: "Logement", date: "22 Oct 2024", method: "Prélèvement", amount: -112.5 },
  { name: "Total Station", category: "Transport", date: "21 Oct 2024", method: "Visa •••• 4242", amount: -55.0 },
  { name: "Le Petit Bistro", category: "Loisirs", date: "20 Oct 2024", method: "Apple Pay", amount: -42.3 },
  { name: "Netflix Premium", category: "Abonnements", date: "19 Oct 2024", method: "Carte Débit", amount: -17.99 },
  { name: "Pharmacie Centrale", category: "Santé", date: "18 Oct 2024", method: "Visa •••• 4242", amount: -34.5 },
  { name: "Loyer Octobre", category: "Logement", date: "01 Oct 2024", method: "Virement SEPA", amount: -850.0 },
  { name: "Freelance Mission", category: "Revenus", date: "15 Oct 2024", method: "Virement SEPA", amount: 1200.0 },
  { name: "Spotify", category: "Abonnements", date: "10 Oct 2024", method: "Carte Débit", amount: -9.99 },
  { name: "SNCF Billet", category: "Transport", date: "08 Oct 2024", method: "Visa •••• 4242", amount: -67.0 },
  { name: "Mutuelle Santé", category: "Santé", date: "05 Oct 2024", method: "Prélèvement", amount: -45.0 },
];

const categories = ["Toutes les catégories", "Alimentation", "Revenus", "Logement", "Transport", "Loisirs", "Abonnements", "Santé"];
const periods = ["30 derniers jours", "7 derniers jours", "3 derniers mois", "Cette année"];
const types = ["Type : Tout", "Dépenses", "Revenus"];

const ITEMS_PER_PAGE = 8;

export default function TransactionsPage() {
  const [category, setCategory] = useState("Toutes les catégories");
  const [period, setPeriod] = useState("30 derniers jours");
  const [type, setType] = useState("Type : Tout");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const filtered = allTransactions.filter((t) => {
    const matchCat = category === "Toutes les catégories" || t.category === category;
    const matchType = type === "Type : Tout" || (type === "Revenus" ? t.amount > 0 : t.amount < 0);
    return matchCat && matchType;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totalDepenses = filtered.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalRevenus = filtered.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const solde = totalRevenus - totalDepenses;

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
            Historique des Transactions
          </h1>
          <p className="text-tertiary text-sm mt-1">Gérez et analysez vos flux financiers avec précision.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors flex items-center gap-2"
        >
          + Ajouter une transaction
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Dépenses ce mois", value: `${totalDepenses.toFixed(2)} €`, change: "+12%", color: "text-danger" },
          { label: "Revenus ce mois", value: `${totalRevenus.toFixed(2)} €`, change: "+8%", color: "text-success" },
          { label: "Solde disponible", value: `${solde.toFixed(2)} €`, change: "", color: "text-primary" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-border rounded-2xl p-5">
            <p className="text-xs font-semibold text-tertiary uppercase tracking-wide mb-2">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.color}`} style={{ fontFamily: "var(--font-heading)" }}>
              {kpi.value}
            </p>
            {kpi.change && <p className="text-xs text-tertiary mt-1">{kpi.change} vs mois dernier</p>}
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-2xl p-5">

        {/* Filtres */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          {[
            { value: period, options: periods, onChange: setPeriod },
            { value: category, options: categories, onChange: setCategory },
            { value: type, options: types, onChange: setType },
          ].map((filter, i) => (
            <select
              key={i}
              value={filter.value}
              onChange={(e) => { filter.onChange(e.target.value); setPage(1); }}
              className="text-sm border border-border rounded-lg px-3 py-2 text-primary bg-neutral outline-none focus:border-secondary transition-colors cursor-pointer"
            >
              {filter.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ))}
          <span className="text-xs text-tertiary ml-auto">
            Affichage de {filtered.length} transactions
          </span>
        </div>

        {/* En-têtes */}
        <div className="grid grid-cols-5 gap-4 px-4 py-2 mb-1">
          {["DATE", "DESCRIPTION", "CATÉGORIE", "MÉTHODE", "MONTANT"].map((h) => (
            <span key={h} className="text-xs font-semibold text-tertiary uppercase tracking-wide">{h}</span>
          ))}
        </div>

        {/* Lignes */}
        <div className="flex flex-col gap-1">
          {paginated.map((t, i) => (
            <div key={i} className="grid grid-cols-5 gap-4 px-4 py-3 rounded-xl hover:bg-neutral transition-colors items-center cursor-pointer">
              <span className="text-xs text-tertiary">{t.date}</span>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral border border-border flex items-center justify-center text-xs font-bold text-tertiary shrink-0">
                  {t.name[0]}
                </div>
                <span className="text-sm font-medium text-primary truncate">{t.name}</span>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-lg w-fit ${
                t.category === "Revenus" ? "bg-success/10 text-success" : "bg-secondary/10 text-secondary"
              }`}>
                {t.category}
              </span>
              <span className="text-xs text-tertiary">{t.method}</span>
              <span className={`text-sm font-bold ${t.amount > 0 ? "text-success" : "text-danger"}`}>
                {t.amount > 0 ? "+" : ""}{t.amount.toFixed(2)} €
              </span>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-sm text-tertiary px-4 py-2 rounded-lg border border-border hover:bg-neutral transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Précédent
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                  page === p ? "bg-primary text-white" : "text-tertiary hover:bg-neutral border border-border"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-sm text-tertiary px-4 py-2 rounded-lg border border-border hover:bg-neutral transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Suivant →
          </button>
        </div>
      </div>

      {/* Modal ajout transaction */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
                Nouvelle transaction
              </h2>
              <button onClick={() => setShowModal(false)} className="text-tertiary hover:text-primary text-xl leading-none">×</button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Description</label>
                <input type="text" placeholder="Ex: Supermarché" className="w-full border border-border rounded-lg px-4 py-3 text-sm text-primary outline-none focus:border-secondary transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Montant (€)</label>
                  <input type="number" placeholder="0.00" className="w-full border border-border rounded-lg px-4 py-3 text-sm text-primary outline-none focus:border-secondary transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Type</label>
                  <select className="w-full border border-border rounded-lg px-4 py-3 text-sm text-primary outline-none focus:border-secondary transition-colors bg-white">
                    <option>Dépense</option>
                    <option>Revenu</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Catégorie</label>
                <select className="w-full border border-border rounded-lg px-4 py-3 text-sm text-primary outline-none focus:border-secondary transition-colors bg-white">
                  {categories.slice(1).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Date</label>
                <input type="date" className="w-full border border-border rounded-lg px-4 py-3 text-sm text-primary outline-none focus:border-secondary transition-colors" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-border text-tertiary py-3 rounded-xl text-sm font-semibold hover:bg-neutral transition-colors">
                Annuler
              </button>
              <button className="flex-1 bg-primary text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors">
                Ajouter →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}