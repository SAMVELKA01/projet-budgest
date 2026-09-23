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
  Sparkles,
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

const pastelRotation = ["bg-pastel-sand", "bg-pastel-sage", "bg-pastel-mauve", "bg-pastel-olive", "bg-pastel-sand", "bg-pastel-sage"];

function AreaChart({ buckets, hoveredBar, setHoveredBar }: { buckets: Bucket[]; hoveredBar: number | null; setHoveredBar: (i: number | null) => void }) {
  const W = 100;
  const H = 100;
  const max = Math.max(...buckets.map((b) => Math.max(b.revenus, b.depenses)), 1);
  const step = buckets.length > 1 ? W / (buckets.length - 1) : W;
  const pts = (key: "revenus" | "depenses") => buckets.map((b, i) => `${i * step},${H - (b[key] / max) * H}`).join(" ");
  const areaPath = (key: "revenus" | "depenses") => `M0,${H} L${pts(key)} L${W},${H} Z`;

  return (
    <div className="relative" style={{ height: "170px" }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full">
        <path d={areaPath("depenses")} fill="#E15B5B" opacity={0.15} />
        <path d={areaPath("revenus")} fill="#4CAF7D" opacity={0.15} />
        <polyline points={pts("depenses")} fill="none" stroke="#E15B5B" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <polyline points={pts("revenus")} fill="none" stroke="#4CAF7D" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="absolute inset-0 flex">
        {buckets.map((b, i) => (
          <div key={i} className="flex-1 cursor-pointer" onMouseEnter={() => setHoveredBar(i)} onMouseLeave={() => setHoveredBar(null)}>
            {hoveredBar === i && <div className="w-px h-full bg-ink/20 mx-auto" />}
          </div>
        ))}
      </div>
      <div className="flex mt-2">
        {buckets.map((b, i) => (
          <span key={i} className="flex-1 text-center text-[10px] text-tertiary truncate">{b.label}</span>
        ))}
      </div>
    </div>
  );
}

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
  const epargne = data ? data.totals.revenus - data.totals.depenses : 0;
  const tauxEpargne = data && data.totals.revenus > 0 ? ((epargne / data.totals.revenus) * 100).toFixed(1) : "0";
  const dominante = data?.categoryBreakdown[0]?.name || "-";

  const nonEmptyBuckets = buckets.filter((b) => b.revenus > 0 || b.depenses > 0);
  const comparaisonBuckets = nonEmptyBuckets.slice(-6);
  const meilleureBucket = [...nonEmptyBuckets].sort((a, b) => (b.revenus - b.depenses) - (a.revenus - a.depenses))[0];

  const kpis = [
    { label: "Revenus", value: data ? format(data.totals.revenus) : "-", sub: "Sur la période", icon: TrendingUp, bg: "bg-pastel-sage" },
    { label: "Dépenses", value: data ? format(data.totals.depenses) : "-", sub: "Sur la période", icon: TrendingDown, bg: "bg-pastel-mauve" },
    { label: "Épargne nette", value: data ? format(epargne) : "-", sub: "Revenus - Dépenses", icon: PiggyBank, bg: "bg-pastel-sand" },
    { label: "Taux d'épargne", value: `${tauxEpargne}%`, sub: "Du revenu total", icon: Percent, bg: "bg-pastel-olive" },
    { label: "Transactions", value: data ? `${data.totals.count}` : "-", sub: "Toutes confondues", icon: Receipt, bg: "bg-pastel-sand" },
    { label: "Catégorie dominante", value: dominante, sub: "Plus grosse dépense", icon: Tag, bg: "bg-pastel-sage" },
  ];

  const analyseIA = data
    ? epargne >= 0
      ? `Vous avez épargné ${format(epargne)} sur cette période, soit un taux d'épargne de ${tauxEpargne}%. La catégorie "${dominante}" concentre la plus grosse part de vos dépenses.`
      : `Vos dépenses dépassent vos revenus de ${format(Math.abs(epargne))} sur cette période. La catégorie "${dominante}" est celle qui pèse le plus — c'est un bon point de départ pour ajuster votre budget.`
    : "";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-semibold text-primary" style={{ fontFamily: "var(--font-heading)" }}>Statistiques</h1>
        <p className="text-tertiary text-sm mt-1">Explorez et analysez vos finances par jour, semaine ou mois.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 bg-white border border-border rounded-full p-1">
          {granularites.map((g) => (
            <button key={g.key} onClick={() => changeGranularity(g.key)}
              className={`text-sm px-4 py-1.5 rounded-full font-medium transition-colors ${granularity === g.key ? "bg-gold text-ink" : "text-tertiary hover:text-ink"}`}>
              {g.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-white border border-border rounded-full px-2 py-1.5">
          <button onClick={() => setOffset((o) => o - 1)} className="p-1.5 rounded-full text-tertiary hover:text-ink hover:bg-neutral transition-colors" aria-label="Période précédente">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-primary min-w-[180px] text-center capitalize">{data?.label || "…"}</span>
          <button onClick={() => setOffset((o) => Math.min(o + 1, 0))} disabled={!data?.canGoNext}
            className="p-1.5 rounded-full text-tertiary hover:text-ink hover:bg-neutral transition-colors disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Période suivante">
            <ChevronRight size={16} />
          </button>
          {offset !== 0 && (
            <button onClick={() => setOffset(0)} className="text-xs font-medium text-ink ml-1 hover:underline">
              {granularites.find((g) => g.key === granularity)?.resetLabel}
            </button>
          )}
        </div>
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-ink border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {kpis.map((kpi) => (
              <div key={kpi.label} className={`${kpi.bg} rounded-2xl p-6`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-medium text-ink/60 uppercase tracking-wider">{kpi.label}</p>
                  <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center">
                    <kpi.icon size={15} className="text-ink" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-ink truncate tabular-nums">{kpi.value}</p>
                <p className="text-xs text-ink/50 mt-1">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {data && (
            <div className="bg-pastel-mauve rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shrink-0">
                <Sparkles size={18} className="text-ink" />
              </div>
              <div>
                <span className="inline-block text-[10px] font-bold text-ink/50 uppercase tracking-wider mb-1">Généré par l&apos;IA</span>
                <p className="text-sm text-ink">{analyseIA}</p>
              </div>
            </div>
          )}

          <div className="bg-white border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-ink" style={{ fontFamily: "var(--font-heading)" }}>Revenus vs Dépenses</h3>
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
                  <span className="text-success font-semibold">{format(buckets[hoveredBar].revenus)}</span>
                  {" · "}Dépenses <span className="text-danger font-semibold">{format(buckets[hoveredBar].depenses)}</span>
                </p>
              )}
            </div>
            {buckets.every((b) => b.depenses === 0 && b.revenus === 0) ? (
              <div className="h-40 flex items-center justify-center">
                <p className="text-sm text-tertiary">Aucune transaction sur cette période.</p>
              </div>
            ) : (
              <AreaChart buckets={buckets} hoveredBar={hoveredBar} setHoveredBar={setHoveredBar} />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-border rounded-2xl p-6">
              <h3 className="font-semibold text-ink mb-5" style={{ fontFamily: "var(--font-heading)" }}>Dépenses par catégorie</h3>
              {!data || data.categoryBreakdown.length === 0 ? (
                <p className="text-sm text-tertiary">Aucune dépense sur cette période.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {data.categoryBreakdown.slice(0, 5).map((cat, i) => (
                    <div key={cat.name} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-tertiary w-4 shrink-0">{i + 1}</span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 ${pastelRotation[i]}`}>{cat.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-ink">{cat.name}</span>
                          <span className="text-sm font-bold text-danger tabular-nums">-{format(cat.amount)}</span>
                        </div>
                        <div className="w-full bg-neutral rounded-full h-1.5">
                          <div className="h-1.5 rounded-full" style={{ width: `${(cat.amount / data.categoryBreakdown[0].amount) * 100}%`, background: cat.colorHex }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-border rounded-2xl p-6">
              <h3 className="font-semibold text-ink mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                Comparaison {granularites.find((g) => g.key === granularity)?.comparaisonLabel}
              </h3>
              <p className="text-xs text-tertiary mb-5">Solde (revenus - dépenses) des dernières périodes non vides</p>
              {comparaisonBuckets.length === 0 ? (
                <p className="text-sm text-tertiary">Pas encore assez de données sur cette période.</p>
              ) : (
                <>
                  <div className="flex flex-col gap-3 mb-5">
                    {comparaisonBuckets.map((b, i) => {
                      const solde = b.revenus - b.depenses;
                      return (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm text-ink font-medium">{b.label}</span>
                          <span className={`text-sm font-bold tabular-nums ${solde >= 0 ? "text-success" : "text-danger"}`}>
                            {solde >= 0 ? "+" : ""}{format(solde)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {meilleureBucket && (
                    <div className="bg-pastel-sage rounded-xl p-4">
                      <p className="text-xs font-semibold text-ink/60 uppercase tracking-wide mb-1">Meilleure période</p>
                      <p className="text-sm text-ink">
                        <span className="font-bold">{meilleureBucket.label}</span> avec un solde de{" "}
                        <span className="font-bold tabular-nums">{format(meilleureBucket.revenus - meilleureBucket.depenses)}</span>
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
