"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Receipt,
  Tag,
  PiggyBank,
  Percent,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useDevise } from "@/lib/context/DeviseContext";

type Granularity = "day" | "week" | "month";

interface Bucket {
  label: string;
  revenus: number;
  depenses: number;
}
interface CategoryBreakdown {
  name: string;
  amount: number;
  colorHex: string;
  icon: string;
}
interface StatsResponse {
  granularity: Granularity;
  offset: number;
  label: string;
  canGoNext: boolean;
  totals: { revenus: number; depenses: number; solde: number; count: number; depensesCount: number };
  buckets: Bucket[];
  categoryBreakdown: CategoryBreakdown[];
}

const granularites: { key: Granularity; label: string; resetLabel: string; comparaisonLabel: string }[] = [
  { key: "day", label: "Jour", resetLabel: "Aujourd'hui", comparaisonLabel: "par heure" },
  { key: "week", label: "Semaine", resetLabel: "Cette semaine", comparaisonLabel: "par jour" },
  { key: "month", label: "Mois", resetLabel: "Ce mois-ci", comparaisonLabel: "par jour" },
];

export default function StatistiquesPage() {
  const [granularity, setGranularity] = useState<Granularity>("week");
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const { format } = useDevise();

  const fetchStats = useCallback((g: Granularity, o: number) => {
    setLoading(true);
    fetch(`/api/stats?granularity=${g}&offset=${o}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Rechargement volontaire à chaque changement de période.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats(granularity, offset);
  }, [granularity, offset, fetchStats]);

  const changeGranularity = useCallback((g: Granularity) => {
    setGranularity(g);
    setOffset(0);
  }, []);

  const buckets = data?.buckets || [];
  const maxBucket = Math.max(...buckets.map((b) => Math.max(b.revenus, b.depenses)), 1);
  const epargne = data ? data.totals.revenus - data.totals.depenses : 0;
  const tauxEpargne =
    data && data.totals.revenus > 0
      ? ((epargne / data.totals.revenus) * 100).toFixed(1)
      : "0";
  const dominante = data?.categoryBreakdown[0]?.name || "-";

  const nonEmptyBuckets = buckets.filter((b) => b.revenus > 0 || b.depenses > 0);
  const comparaisonBuckets = nonEmptyBuckets.slice(-6);
  const meilleureBucket = [...nonEmptyBuckets].sort(
    (a, b) => b.revenus - b.depenses - (a.revenus - a.depenses),
  )[0];

  const kpis = [
    {
      label: "Revenus",
      value: data ? format(data.totals.revenus) : "-",
      sub: "Sur la période",
      icon: TrendingUp,
      iconColor: "text-success",
    },
    {
      label: "Dépenses",
      value: data ? format(data.totals.depenses) : "-",
      sub: "Sur la période",
      icon: TrendingDown,
      iconColor: "text-danger",
    },
    {
      label: "Épargne nette",
      value: data ? format(epargne) : "-",
      sub: "Revenus - Dépenses",
      icon: PiggyBank,
      iconColor: "text-info",
    },
    {
      label: "Taux d'épargne",
      value: `${tauxEpargne}%`,
      sub: "Du revenu total",
      icon: Percent,
      iconColor: "text-warning",
    },
    {
      label: "Transactions",
      value: data ? `${data.totals.count}` : "-",
      sub: "Toutes confondues",
      icon: Receipt,
      iconColor: "text-primary",
    },
    {
      label: "Catégorie dominante",
      value: dominante,
      sub: "Plus grosse dépense",
      icon: Tag,
      iconColor: "text-primary",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1
          className="text-[28px] font-semibold text-primary"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Statistiques
        </h1>
        <p className="text-tertiary text-sm mt-1">
          Explorez et analysez vos finances par jour, semaine ou mois.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 bg-white border border-border rounded-xl p-1">
          {granularites.map((g) => (
            <button
              key={g.key}
              onClick={() => changeGranularity(g.key)}
              className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-colors ${
                granularity === g.key
                  ? "bg-primary text-inverse"
                  : "text-tertiary hover:text-primary"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-white border border-border rounded-xl px-2 py-1.5">
          <button
            onClick={() => setOffset((o) => o - 1)}
            className="p-1.5 rounded-lg text-tertiary hover:text-primary hover:bg-neutral transition-colors"
            aria-label="Période précédente"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-primary min-w-[180px] text-center capitalize">
            {data?.label || "…"}
          </span>
          <button
            onClick={() => setOffset((o) => Math.min(o + 1, 0))}
            disabled={!data?.canGoNext}
            className="p-1.5 rounded-lg text-tertiary hover:text-primary hover:bg-neutral transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Période suivante"
          >
            <ChevronRight size={16} />
          </button>
          {offset !== 0 && (
            <button
              onClick={() => setOffset(0)}
              className="text-xs font-medium text-secondary ml-1 hover:underline"
            >
              {granularites.find((g) => g.key === granularity)?.resetLabel}
            </button>
          )}
        </div>
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="bg-white border border-border rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-medium text-tertiary uppercase tracking-wider">
                    {kpi.label}
                  </p>
                  <div className="w-8 h-8 rounded-xl bg-neutral flex items-center justify-center">
                    <kpi.icon size={15} className={kpi.iconColor} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-primary truncate tabular-nums">
                  {kpi.value}
                </p>
                <p className="text-xs text-tertiary mt-1">{kpi.sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3
                className="font-bold text-primary"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Revenus vs Dépenses
              </h3>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-tertiary bg-neutral px-2.5 py-1 rounded-full">
                  <span className="w-2.5 h-2.5 rounded-full bg-success inline-block" /> Revenus
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-tertiary bg-neutral px-2.5 py-1 rounded-full">
                  <span className="w-2.5 h-2.5 rounded-full bg-danger inline-block" /> Dépenses
                </span>
              </div>
            </div>
            <div className="h-5 mb-3">
              {hoveredBar !== null && buckets[hoveredBar] && (
                <p className="text-xs text-tertiary">
                  {buckets[hoveredBar].label} — Revenus{" "}
                  <span className="text-success font-semibold">
                    {format(buckets[hoveredBar].revenus)}
                  </span>
                  {" · "}Dépenses{" "}
                  <span className="text-danger font-semibold">
                    {format(buckets[hoveredBar].depenses)}
                  </span>
                </p>
              )}
            </div>
            {buckets.every((b) => b.depenses === 0 && b.revenus === 0) ? (
              <div className="h-40 flex items-center justify-center">
                <p className="text-sm text-tertiary">
                  Aucune transaction sur cette période.
                </p>
              </div>
            ) : (
              <div
                className="flex items-end gap-2 overflow-x-auto"
                style={{ height: "170px" }}
              >
                {buckets.map((b, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0"
                    style={{
                      width: buckets.length > 10 ? "28px" : undefined,
                      flex: buckets.length > 10 ? undefined : "1 1 0",
                    }}
                    onMouseEnter={() => setHoveredBar(i)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <div className="flex items-end gap-0.5 w-full" style={{ height: "140px" }}>
                      <div
                        className="flex-1 rounded-t-md transition-all"
                        style={{
                          height: `${(b.revenus / maxBucket) * 140}px`,
                          background: hoveredBar === i ? "#13141A" : "#4CAF7D",
                          minHeight: b.revenus > 0 ? "3px" : "0",
                        }}
                      />
                      <div
                        className="flex-1 rounded-t-md transition-all"
                        style={{
                          height: `${(b.depenses / maxBucket) * 140}px`,
                          background: hoveredBar === i ? "#13141A" : "#E15B5B",
                          minHeight: b.depenses > 0 ? "3px" : "0",
                        }}
                      />
                    </div>
                    <span className="text-xs text-tertiary">{b.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-border rounded-2xl p-6">
              <h3
                className="font-bold text-primary mb-5"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Dépenses par catégorie
              </h3>
              {!data || data.categoryBreakdown.length === 0 ? (
                <p className="text-sm text-tertiary">
                  Aucune dépense sur cette période.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {data.categoryBreakdown.slice(0, 5).map((cat, i) => (
                    <div key={cat.name} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-tertiary w-4 shrink-0">
                        {i + 1}
                      </span>
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: cat.colorHex }}
                      >
                        {cat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-primary">
                            {cat.name}
                          </span>
                          <span className="text-sm font-bold text-danger">
                            -{format(cat.amount)}
                          </span>
                        </div>
                        <div className="w-full bg-neutral rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${(cat.amount / data.categoryBreakdown[0].amount) * 100}%`,
                              background: cat.colorHex,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-border rounded-2xl p-6">
              <h3
                className="font-bold text-primary mb-1"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Comparaison {granularites.find((g) => g.key === granularity)?.comparaisonLabel}
              </h3>
              <p className="text-xs text-tertiary mb-5">
                Solde (revenus - dépenses) des dernières périodes non vides
              </p>
              {comparaisonBuckets.length === 0 ? (
                <p className="text-sm text-tertiary">
                  Pas encore assez de données sur cette période.
                </p>
              ) : (
                <>
                  <div className="flex flex-col gap-3 mb-5">
                    {comparaisonBuckets.map((b, i) => {
                      const solde = b.revenus - b.depenses;
                      return (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm text-primary font-medium">{b.label}</span>
                          <span
                            className={`text-sm font-bold ${solde >= 0 ? "text-success" : "text-danger"}`}
                          >
                            {solde >= 0 ? "+" : ""}
                            {format(solde)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {meilleureBucket && (
                    <div className="bg-success/10 rounded-xl p-4">
                      <p className="text-xs font-semibold text-success uppercase tracking-wide mb-1">
                        Meilleure période
                      </p>
                      <p className="text-sm text-primary">
                        <span className="font-bold">{meilleureBucket.label}</span> avec un solde de{" "}
                        <span className="font-bold text-success">
                          {format(meilleureBucket.revenus - meilleureBucket.depenses)}
                        </span>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
