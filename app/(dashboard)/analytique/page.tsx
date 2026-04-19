"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, PiggyBank, Percent } from "lucide-react";

const monthlyData = [
  { month: "Jan", revenus: 3200, depenses: 1800 },
  { month: "Fév", revenus: 3200, depenses: 2100 },
  { month: "Mar", revenus: 3500, depenses: 1950 },
  { month: "Avr", revenus: 3200, depenses: 2300 },
  { month: "Mai", revenus: 4100, depenses: 2050 },
  { month: "Jun", revenus: 3200, depenses: 1750 },
  { month: "Jul", revenus: 3200, depenses: 2400 },
  { month: "Aoû", revenus: 3800, depenses: 2200 },
  { month: "Sep", revenus: 3200, depenses: 1900 },
  { month: "Oct", revenus: 4820, depenses: 2140 },
  { month: "Nov", revenus: 3200, depenses: 0 },
  { month: "Déc", revenus: 0, depenses: 0 },
];

const categoryData = [
  { name: "Logement", amount: 962, pct: 45, colorHex: "#3B82F6" },
  { name: "Alimentation", amount: 280, pct: 32, colorHex: "#10B981" },
  { name: "Transport", amount: 122, pct: 12, colorHex: "#F59E0B" },
  { name: "Loisirs", amount: 42, pct: 6, colorHex: "#8B5CF6" },
  { name: "Abonnements", amount: 27, pct: 3, colorHex: "#EC4899" },
  { name: "Santé", amount: 79, pct: 2, colorHex: "#64748B" },
];

const periodes = ["3 mois", "6 mois", "12 mois"];

export default function AnalytiquePage() {
  const [periode, setPeriode] = useState("12 mois");
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const months = periode === "3 mois" ? monthlyData.slice(7, 10)
    : periode === "6 mois" ? monthlyData.slice(4, 10)
    : monthlyData.slice(0, 10);

  const totalRevenus = months.reduce((s, d) => s + d.revenus, 0);
  const totalDepenses = months.reduce((s, d) => s + d.depenses, 0);
  const epargne = totalRevenus - totalDepenses;
  const tauxEpargne = totalRevenus > 0 ? ((epargne / totalRevenus) * 100).toFixed(1) : "0";
  const maxVal = Math.max(...months.map(d => Math.max(d.revenus, d.depenses)));

  const meilleurMois = [...months].sort((a, b) => (b.revenus - b.depenses) - (a.revenus - a.depenses))[0];

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
            Analytique
          </h1>
          <p className="text-tertiary text-sm mt-1">Analyse détaillée de vos flux financiers.</p>
        </div>
        <div className="flex gap-2 bg-white border border-border rounded-xl p-1">
          {periodes.map((p) => (
            <button
              key={p}
              onClick={() => setPeriode(p)}
              className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-colors ${
                periode === p ? "bg-primary text-white" : "text-tertiary hover:text-primary"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total revenus", value: `${totalRevenus.toLocaleString()} €`, sub: "Sur la période", icon: TrendingUp, iconColor: "text-success", iconBg: "bg-success/10", color: "text-success" },
          { label: "Total dépenses", value: `${totalDepenses.toLocaleString()} €`, sub: "Sur la période", icon: TrendingDown, iconColor: "text-danger", iconBg: "bg-danger/10", color: "text-danger" },
          { label: "Épargne nette", value: `${epargne.toLocaleString()} €`, sub: "Revenus - Dépenses", icon: PiggyBank, iconColor: "text-secondary", iconBg: "bg-secondary/10", color: "text-secondary" },
          { label: "Taux d'épargne", value: `${tauxEpargne}%`, sub: "Du revenu total", icon: Percent, iconColor: "text-warning", iconBg: "bg-warning/10", color: "text-primary" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-tertiary uppercase tracking-wide">{kpi.label}</p>
              <div className={`w-8 h-8 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                <kpi.icon size={15} className={kpi.iconColor} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${kpi.color}`} style={{ fontFamily: "var(--font-heading)" }}>
              {kpi.value}
            </p>
            <p className="text-xs text-tertiary mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Graphique revenus vs dépenses */}
      <div className="bg-white border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
              Revenus vs Dépenses
            </h3>
            {hoveredMonth !== null && (
              <p className="text-xs text-tertiary mt-1">
                {months[hoveredMonth]?.month} — Revenus : <span className="text-success font-semibold">{months[hoveredMonth]?.revenus.toLocaleString()} €</span>
                {" · "}Dépenses : <span className="text-danger font-semibold">{months[hoveredMonth]?.depenses.toLocaleString()} €</span>
              </p>
            )}
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-success" />
              <span className="text-xs text-tertiary">Revenus</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-danger" />
              <span className="text-xs text-tertiary">Dépenses</span>
            </div>
          </div>
        </div>

        <div className="flex items-end gap-2" style={{ height: "200px" }}>
          {months.map((d, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1 cursor-pointer"
              onMouseEnter={() => setHoveredMonth(i)}
              onMouseLeave={() => setHoveredMonth(null)}
            >
              <div className="w-full flex gap-0.5 items-end" style={{ height: "170px" }}>
                <div
                  className="flex-1 rounded-t-md transition-all"
                  style={{
                    height: `${maxVal > 0 ? (d.revenus / maxVal) * 100 : 0}%`,
                    background: hoveredMonth === i ? "#10B981" : "rgba(16,185,129,0.5)",
                  }}
                />
                <div
                  className="flex-1 rounded-t-md transition-all"
                  style={{
                    height: `${maxVal > 0 ? (d.depenses / maxVal) * 100 : 0}%`,
                    background: hoveredMonth === i ? "#EF4444" : "rgba(239,68,68,0.4)",
                  }}
                />
              </div>
              <span className="text-xs text-tertiary">{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">

        {/* Dépenses par catégorie */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <h3 className="font-bold text-primary mb-5" style={{ fontFamily: "var(--font-heading)" }}>
            Dépenses par catégorie
          </h3>
          <div className="flex flex-col gap-4">
            {categoryData.map((cat) => (
              <div key={cat.name}>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.colorHex }} />
                    <span className="text-sm font-medium text-primary">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-tertiary">{cat.pct}%</span>
                    <span className="text-sm font-bold text-primary w-16 text-right">{cat.amount} €</span>
                  </div>
                </div>
                <div className="w-full bg-neutral rounded-full h-1.5">
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${cat.pct}%`, background: cat.colorHex }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparaison + meilleur mois */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <h3 className="font-bold text-primary mb-5" style={{ fontFamily: "var(--font-heading)" }}>
            Comparaison mensuelle
          </h3>
          <div className="flex flex-col gap-1 mb-4">
            {months.slice(-4).map((d) => {
              const solde = d.revenus - d.depenses;
              const ratio = d.revenus > 0 ? (d.depenses / d.revenus) * 100 : 0;
              return (
                <div key={d.month} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                  <span className="text-sm font-bold text-primary w-8 shrink-0">{d.month}</span>
                  <div className="flex-1">
                    <div className="w-full bg-neutral rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-secondary transition-all" style={{ width: `${Math.min(ratio, 100)}%` }} />
                    </div>
                  </div>
                  <span className={`text-sm font-bold w-20 text-right shrink-0 ${solde >= 0 ? "text-success" : "text-danger"}`}>
                    {solde >= 0 ? "+" : ""}{solde.toLocaleString()} €
                  </span>
                </div>
              );
            })}
          </div>

          {/* Meilleur mois */}
          <div className="bg-success/10 border border-success/20 rounded-xl p-4">
            <p className="text-xs font-semibold text-success uppercase tracking-wide mb-1">Meilleur mois</p>
            <p className="text-sm font-bold text-primary">
              {meilleurMois?.month} — Épargne de {(meilleurMois?.revenus - meilleurMois?.depenses).toLocaleString()} €
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}