"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, Wallet, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";

const transactions = [
  { name: "Monoprix Paris", category: "Alimentation", date: "24 Oct 2024", method: "Visa •••• 4242", amount: -88.20 },
  { name: "Virement Salaire", category: "Revenus", date: "23 Oct 2024", method: "Virement SEPA", amount: 3280.00 },
  { name: "EDF Électricité", category: "Logement", date: "22 Oct 2024", method: "Prélèvement", amount: -112.50 },
  { name: "Total Station", category: "Transport", date: "21 Oct 2024", method: "Visa •••• 4242", amount: -55.00 },
  { name: "Netflix Premium", category: "Abonnements", date: "19 Oct 2024", method: "Carte Débit", amount: -17.99 },
];

const barData = [
  { month: "Avr", revenus: 3200, depenses: 1800 },
  { month: "Mai", revenus: 4100, depenses: 2050 },
  { month: "Jun", revenus: 3200, depenses: 1750 },
  { month: "Jul", revenus: 3200, depenses: 2400 },
  { month: "Aoû", revenus: 3800, depenses: 2200 },
  { month: "Sep", revenus: 3200, depenses: 1900 },
  { month: "Oct", revenus: 4820, depenses: 2140 },
];

const repartition = [
  { label: "Logement", pct: 45, colorHex: "#3B82F6" },
  { label: "Alimentation", pct: 32, colorHex: "#10B981" },
  { label: "Autres", pct: 23, colorHex: "#F59E0B" },
];

const maxVal = Math.max(...barData.map(d => Math.max(d.revenus, d.depenses)));

export default function DashboardPage() {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-6">

      {/* Alerte */}
      <div className="bg-warning/10 border border-warning/30 rounded-2xl px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-warning/20 flex items-center justify-center shrink-0">
            <AlertTriangle size={16} className="text-warning" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">Attention, vos dépenses augmentent ce mois-ci</p>
            <p className="text-xs text-tertiary mt-0.5">Logement dépassé de 62€ · Transport à 81% du budget</p>
          </div>
        </div>
        <Link href="/transactions" className="text-xs font-semibold text-warning no-underline hover:underline whitespace-nowrap">
          Voir les détails →
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-tertiary uppercase tracking-wide">Solde total</p>
            <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Wallet size={15} className="text-secondary" />
            </div>
          </div>
          <p className="text-3xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
            12 450,20 €
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center gap-1 text-success">
              <ArrowUpRight size={13} />
              <span className="text-xs font-semibold">+2,4%</span>
            </div>
            <span className="text-xs text-tertiary">depuis le mois dernier</span>
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-tertiary uppercase tracking-wide">Revenus ce mois</p>
            <div className="w-8 h-8 rounded-xl bg-success/10 flex items-center justify-center">
              <TrendingUp size={15} className="text-success" />
            </div>
          </div>
          <p className="text-3xl font-bold text-success" style={{ fontFamily: "var(--font-heading)" }}>
            4 820,00 €
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-xs text-tertiary">Objectif atteint à</span>
            <span className="text-xs font-semibold text-success">84%</span>
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-tertiary uppercase tracking-wide">Dépenses</p>
            <div className="w-8 h-8 rounded-xl bg-danger/10 flex items-center justify-center">
              <TrendingDown size={15} className="text-danger" />
            </div>
          </div>
          <p className="text-3xl font-bold text-danger" style={{ fontFamily: "var(--font-heading)" }}>
            2 140,55 €
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center gap-1 text-danger">
              <ArrowDownRight size={13} />
              <span className="text-xs font-semibold">+15%</span>
            </div>
            <span className="text-xs text-tertiary">vs le mois dernier</span>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-3 gap-4">

        {/* Évolution mensuelle */}
        <div className="col-span-2 bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
              Évolution Mensuelle
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-xs text-tertiary">Revenus</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-danger" />
                <span className="text-xs text-tertiary">Dépenses</span>
              </div>
            </div>
          </div>

          {/* Tooltip */}
          <div className="h-5 mb-3">
            {hoveredBar !== null && (
              <p className="text-xs text-tertiary">
                {barData[hoveredBar].month} —{" "}
                <span className="text-success font-semibold">{barData[hoveredBar].revenus.toLocaleString()} €</span>
                {" · "}
                <span className="text-danger font-semibold">{barData[hoveredBar].depenses.toLocaleString()} €</span>
              </p>
            )}
          </div>

          <div className="flex items-end gap-3" style={{ height: "140px" }}>
            {barData.map((d, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-1 cursor-pointer"
                onMouseEnter={() => setHoveredBar(i)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                <div className="w-full flex gap-0.5 items-end" style={{ height: "120px" }}>
                  <div
                    className="flex-1 rounded-t-md transition-all"
                    style={{
                      height: `${(d.revenus / maxVal) * 100}%`,
                      background: hoveredBar === i ? "#10B981" : "rgba(16,185,129,0.4)",
                    }}
                  />
                  <div
                    className="flex-1 rounded-t-md transition-all"
                    style={{
                      height: `${(d.depenses / maxVal) * 100}%`,
                      background: hoveredBar === i ? "#EF4444" : "rgba(239,68,68,0.35)",
                    }}
                  />
                </div>
                <span className="text-xs text-tertiary">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition */}
        <div className="bg-white border border-border rounded-2xl p-5">
          <h3 className="font-bold text-primary mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Répartition
          </h3>

          {/* Cercle SVG */}
          <div className="flex justify-center mb-5">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F1F5F9" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3B82F6" strokeWidth="3.5"
                  strokeDasharray="45 55" strokeLinecap="round" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10B981" strokeWidth="3.5"
                  strokeDasharray="32 68" strokeDashoffset="-45" strokeLinecap="round" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F59E0B" strokeWidth="3.5"
                  strokeDasharray="23 77" strokeDashoffset="-77" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-bold text-primary">2 140€</span>
                <span className="text-xs text-tertiary">total</span>
              </div>
            </div>
          </div>

          {/* Légende */}
          <div className="flex flex-col gap-3">
            {repartition.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.colorHex }} />
                  <span className="text-xs text-tertiary">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-neutral rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${item.pct}%`, background: item.colorHex }} />
                  </div>
                  <span className="text-xs font-bold text-primary w-6 text-right">{item.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions récentes */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
            Transactions Récentes
          </h3>
          <Link href="/transactions" className="text-xs font-semibold text-secondary no-underline hover:underline flex items-center gap-1">
            Voir tout <ArrowUpRight size={12} />
          </Link>
        </div>

        <div className="divide-y divide-border">
          {transactions.map((t, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-neutral/50 transition-colors">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                style={{
                  background: t.amount > 0 ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)",
                  color: t.amount > 0 ? "#10B981" : "#EF4444",
                }}>
                {t.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary truncate">{t.name}</p>
                <p className="text-xs text-tertiary">{t.date} · {t.method}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                t.category === "Revenus" ? "bg-success/10 text-success" : "bg-secondary/10 text-secondary"
              }`}>
                {t.category}
              </span>
              <span className={`text-sm font-bold w-24 text-right shrink-0 ${t.amount > 0 ? "text-success" : "text-danger"}`}>
                {t.amount > 0 ? "+" : ""}{t.amount.toFixed(2)} €
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}