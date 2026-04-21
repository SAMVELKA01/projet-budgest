"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useDevise } from "@/lib/context/DeviseContext";

interface Stats {
  solde: number;
  revenus: number;
  depenses: number;
  evolutionRevenus: number;
  evolutionDepenses: number;
  depensesByCategory: Record<string, number>;
  monthlyEvolution: { month: string; revenus: number; depenses: number }[];
  recentTransactions: {
    _id: string;
    name: string;
    category: string;
    date: string;
    method: string;
    amount: number;
  }[];
}

const repartitionColors: Record<string, string> = {
  Logement: "#3B82F6",
  Alimentation: "#10B981",
  Transport: "#F59E0B",
  Loisirs: "#8B5CF6",
  Abonnements: "#EC4899",
  Santé: "#64748B",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const { format } = useDevise();

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => {
        if (data) setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const maxVal = stats?.monthlyEvolution
    ? Math.max(
        ...stats.monthlyEvolution.map((d) => Math.max(d.revenus, d.depenses)),
      )
    : 0;

  const repartition = stats?.depensesByCategory
    ? Object.entries(stats.depensesByCategory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([label, amount]) => ({
          label,
          amount: amount as number,
          pct: Math.round(((amount as number) / (stats.depenses || 1)) * 100),
          colorHex: repartitionColors[label] || "#64748B",
        }))
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-tertiary">Chargement de vos données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Alerte */}
      {stats && stats.evolutionDepenses > 10 && (
        <div className="bg-warning/10 border border-warning/30 rounded-2xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-warning/20 flex items-center justify-center shrink-0">
              <AlertTriangle size={16} className="text-warning" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">
                Attention, vos dépenses augmentent ce mois-ci
              </p>
              <p className="text-xs text-tertiary mt-0.5">
                +{stats.evolutionDepenses}% par rapport au mois dernier
              </p>
            </div>
          </div>
          <Link
            href="/transactions"
            className="text-xs font-semibold text-warning no-underline hover:underline whitespace-nowrap"
          >
            Voir les détails →
          </Link>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-tertiary uppercase tracking-wide">
              Solde total
            </p>
            <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Wallet size={15} className="text-secondary" />
            </div>
          </div>
          <p
            className="text-3xl font-bold text-primary"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {format(stats?.solde || 0)}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <ArrowUpRight size={13} className="text-success" />
            <span className="text-xs font-semibold text-success">
              {stats?.evolutionRevenus}%
            </span>
            <span className="text-xs text-tertiary">
              depuis le mois dernier
            </span>
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-tertiary uppercase tracking-wide">
              Revenus ce mois
            </p>
            <div className="w-8 h-8 rounded-xl bg-success/10 flex items-center justify-center">
              <TrendingUp size={15} className="text-success" />
            </div>
          </div>
          <p
            className="text-3xl font-bold text-success"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {format(stats?.revenus || 0)}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-xs font-semibold text-success">
              +{stats?.evolutionRevenus}%
            </span>
            <span className="text-xs text-tertiary">vs mois dernier</span>
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-tertiary uppercase tracking-wide">
              Dépenses
            </p>
            <div className="w-8 h-8 rounded-xl bg-danger/10 flex items-center justify-center">
              <TrendingDown size={15} className="text-danger" />
            </div>
          </div>
          <p
            className="text-3xl font-bold text-danger"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {format(stats?.depenses || 0)}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <ArrowDownRight size={13} className="text-danger" />
            <span className="text-xs font-semibold text-danger">
              +{stats?.evolutionDepenses}%
            </span>
            <span className="text-xs text-tertiary">vs mois dernier</span>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-3 gap-4">
        {/* Évolution mensuelle */}
        <div className="col-span-2 bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h3
              className="font-bold text-primary"
              style={{ fontFamily: "var(--font-heading)" }}
            >
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

          <div className="h-5 mb-3">
            {hoveredBar !== null && stats && (
              <p className="text-xs text-tertiary">
                {stats.monthlyEvolution[hoveredBar]?.month} —{" "}
                <span className="text-success font-semibold">
                  {format(stats.monthlyEvolution[hoveredBar]?.revenus || 0)}
                </span>
                {" · "}
                <span className="text-danger font-semibold">
                  {format(stats.monthlyEvolution[hoveredBar]?.depenses || 0)}
                </span>
              </p>
            )}
          </div>

          <div className="flex items-end gap-3" style={{ height: "140px" }}>
            {stats?.monthlyEvolution.map((d, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-1 cursor-pointer"
                onMouseEnter={() => setHoveredBar(i)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                <div
                  className="w-full flex gap-0.5 items-end"
                  style={{ height: "120px" }}
                >
                  <div
                    className="flex-1 rounded-t-md transition-all"
                    style={{
                      height: `${maxVal > 0 ? (d.revenus / maxVal) * 100 : 0}%`,
                      background:
                        hoveredBar === i ? "#10B981" : "rgba(16,185,129,0.4)",
                    }}
                  />
                  <div
                    className="flex-1 rounded-t-md transition-all"
                    style={{
                      height: `${maxVal > 0 ? (d.depenses / maxVal) * 100 : 0}%`,
                      background:
                        hoveredBar === i ? "#EF4444" : "rgba(239,68,68,0.35)",
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
          <h3
            className="font-bold text-primary mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Répartition
          </h3>
          <div className="flex justify-center mb-5">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth="3.5"
                />
                {repartition.map((item, i) => {
                  const offset = repartition
                    .slice(0, i)
                    .reduce((s, r) => s + r.pct, 0);
                  return (
                    <circle
                      key={item.label}
                      cx="18"
                      cy="18"
                      r="15.9"
                      fill="none"
                      stroke={item.colorHex}
                      strokeWidth="3.5"
                      strokeDasharray={`${item.pct} ${100 - item.pct}`}
                      strokeDashoffset={`-${offset}`}
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-bold text-primary">
                  {format(stats?.depenses || 0)}
                </span>
                <span className="text-xs text-tertiary">total</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {repartition.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: item.colorHex }}
                  />
                  <span className="text-xs text-tertiary">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-neutral rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${item.pct}%`,
                        background: item.colorHex,
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-primary w-6 text-right">
                    {item.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions récentes */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3
            className="font-bold text-primary"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Transactions Récentes
          </h3>
          <Link
            href="/transactions"
            className="text-xs font-semibold text-secondary no-underline hover:underline flex items-center gap-1"
          >
            Voir tout <ArrowUpRight size={12} />
          </Link>
        </div>

        {stats?.recentTransactions.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-tertiary">
              Aucune transaction pour le moment.
            </p>
            <Link
              href="/transactions"
              className="text-xs text-secondary font-semibold no-underline hover:underline mt-2 inline-block"
            >
              Ajouter une transaction →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {stats?.recentTransactions.map((t) => (
              <div
                key={t._id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-neutral/50 transition-colors"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    background:
                      t.amount > 0
                        ? "rgba(16,185,129,0.12)"
                        : "rgba(239,68,68,0.1)",
                    color: t.amount > 0 ? "#10B981" : "#EF4444",
                  }}
                >
                  {t.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary truncate">
                    {t.name}
                  </p>
                  <p className="text-xs text-tertiary">
                    {new Date(t.date).toLocaleDateString("fr-FR")} · {t.method}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                    t.category === "Revenus"
                      ? "bg-success/10 text-success"
                      : "bg-secondary/10 text-secondary"
                  }`}
                >
                  {t.category}
                </span>
                <span
                  className={`text-sm font-bold w-24 text-right shrink-0 ${t.amount > 0 ? "text-success" : "text-danger"}`}
                >
                  {t.amount > 0 ? "+" : ""}
                  {format(Math.abs(t.amount))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
