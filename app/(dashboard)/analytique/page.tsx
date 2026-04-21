"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, PiggyBank, Percent } from "lucide-react";
import { useDevise } from "@/lib/context/DeviseContext";

interface MonthData {
  month: string;
  revenus: number;
  depenses: number;
}
interface CategoryData {
  name: string;
  amount: number;
  pct: number;
  colorHex: string;
}

const colorMap: Record<string, string> = {
  Logement: "#3B82F6",
  Alimentation: "#10B981",
  Transport: "#F59E0B",
  Loisirs: "#8B5CF6",
  Abonnements: "#EC4899",
  Santé: "#64748B",
};

const periodes = ["3 mois", "6 mois", "12 mois"];

export default function AnalytiquePage() {
  const [periode, setPeriode] = useState("6 mois");
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const { format, symbol } = useDevise();

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setMonthlyData(data.monthlyEvolution || []);
        const cats = Object.entries(data.depensesByCategory || {})
          .map(([name, amount]) => ({
            name,
            amount: amount as number,
            pct:
              data.depenses > 0
                ? Math.round(((amount as number) / data.depenses) * 100)
                : 0,
            colorHex: colorMap[name] || "#64748B",
          }))
          .sort((a, b) => b.amount - a.amount);
        setCategoryData(cats);
      })
      .finally(() => setLoading(false));
  }, []);

  const months =
    periode === "3 mois"
      ? monthlyData.slice(-3)
      : periode === "6 mois"
        ? monthlyData.slice(-6)
        : monthlyData;

  const totalRevenus = months.reduce((s, d) => s + d.revenus, 0);
  const totalDepenses = months.reduce((s, d) => s + d.depenses, 0);
  const epargne = totalRevenus - totalDepenses;
  const tauxEpargne =
    totalRevenus > 0 ? ((epargne / totalRevenus) * 100).toFixed(1) : "0";
  const maxVal = Math.max(
    ...months.map((d) => Math.max(d.revenus, d.depenses)),
    1,
  );
  const meilleurMois = [...months].sort(
    (a, b) => b.revenus - b.depenses - (a.revenus - a.depenses),
  )[0];

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-primary"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Analytique
          </h1>
          <p className="text-tertiary text-sm mt-1">
            Analyse détaillée de vos flux financiers.
          </p>
        </div>
        <div className="flex gap-2 bg-white border border-border rounded-xl p-1">
          {periodes.map((p) => (
            <button
              key={p}
              onClick={() => setPeriode(p)}
              className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-colors ${periode === p ? "bg-primary text-white" : "text-tertiary hover:text-primary"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total revenus",
            value: `${format(totalRevenus)}`,
            sub: "Sur la période",
            icon: TrendingUp,
            iconColor: "text-success",
            iconBg: "bg-success/10",
            color: "text-success",
          },
          {
            label: "Total dépenses",
            value: `${format(totalDepenses)}`,
            sub: "Sur la période",
            icon: TrendingDown,
            iconColor: "text-danger",
            iconBg: "bg-danger/10",
            color: "text-danger",
          },
          {
            label: "Épargne nette",
            value: `${format(epargne)}`,
            sub: "Revenus - Dépenses",
            icon: PiggyBank,
            iconColor: "text-secondary",
            iconBg: "bg-secondary/10",
            color: "text-secondary",
          },
          {
            label: "Taux d'épargne",
            value: `${tauxEpargne}%`,
            sub: "Du revenu total",
            icon: Percent,
            iconColor: "text-warning",
            iconBg: "bg-warning/10",
            color: "text-primary",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white border border-border rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-tertiary uppercase tracking-wide">
                {kpi.label}
              </p>
              <div
                className={`w-8 h-8 rounded-xl ${kpi.iconBg} flex items-center justify-center`}
              >
                <kpi.icon size={15} className={kpi.iconColor} />
              </div>
            </div>
            <p
              className={`text-2xl font-bold ${kpi.color}`}
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {kpi.value}
            </p>
            <p className="text-xs text-tertiary mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Graphique */}
      <div className="bg-white border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-2">
          <h3
            className="font-bold text-primary"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Revenus vs Dépenses
          </h3>
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

        <div className="h-5 mb-3">
          {hoveredMonth !== null && months[hoveredMonth] && (
            <p className="text-xs text-tertiary">
              {months[hoveredMonth].month} —{" "}
              <span className="text-success font-semibold">
                {format(months[hoveredMonth].revenus)}
              </span>
              {" · "}
              <span className="text-danger font-semibold">
                {format(months[hoveredMonth].depenses)}
              </span>
            </p>
          )}
        </div>

        {months.length === 0 ? (
          <div className="h-48 flex items-center justify-center">
            <p className="text-sm text-tertiary">
              Aucune donnée disponible. Ajoutez des transactions.
            </p>
          </div>
        ) : (
          <div className="flex items-end gap-2" style={{ height: "200px" }}>
            {months.map((d, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-1 cursor-pointer"
                onMouseEnter={() => setHoveredMonth(i)}
                onMouseLeave={() => setHoveredMonth(null)}
              >
                <div
                  className="w-full flex gap-0.5 items-end"
                  style={{ height: "170px" }}
                >
                  <div
                    className="flex-1 rounded-t-md transition-all"
                    style={{
                      height: `${(d.revenus / maxVal) * 100}%`,
                      background:
                        hoveredMonth === i ? "#10B981" : "rgba(16,185,129,0.5)",
                    }}
                  />
                  <div
                    className="flex-1 rounded-t-md transition-all"
                    style={{
                      height: `${(d.depenses / maxVal) * 100}%`,
                      background:
                        hoveredMonth === i ? "#EF4444" : "rgba(239,68,68,0.4)",
                    }}
                  />
                </div>
                <span className="text-xs text-tertiary">{d.month}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Dépenses par catégorie */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <h3
            className="font-bold text-primary mb-5"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Dépenses par catégorie
          </h3>
          {categoryData.length === 0 ? (
            <p className="text-sm text-tertiary">Aucune dépense enregistrée.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {categoryData.map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: cat.colorHex }}
                      />
                      <span className="text-sm font-medium text-primary">
                        {cat.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-tertiary">{cat.pct}%</span>
                      <span className="text-sm font-bold text-primary">
                        {format(cat.amount)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-neutral rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${cat.pct}%`, background: cat.colorHex }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comparaison + meilleur mois */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <h3
            className="font-bold text-primary mb-5"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Comparaison mensuelle
          </h3>
          {months.length === 0 ? (
            <p className="text-sm text-tertiary">Aucune donnée disponible.</p>
          ) : (
            <>
              <div className="flex flex-col gap-1 mb-4">
                {months.slice(-4).map((d) => {
                  const solde = d.revenus - d.depenses;
                  const ratio =
                    d.revenus > 0 ? (d.depenses / d.revenus) * 100 : 0;
                  return (
                    <div
                      key={d.month}
                      className="flex items-center gap-3 py-2.5 border-b border-border last:border-0"
                    >
                      <span className="text-sm font-bold text-primary w-8 shrink-0">
                        {d.month}
                      </span>
                      <div className="flex-1">
                        <div className="w-full bg-neutral rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-secondary"
                            style={{ width: `${Math.min(ratio, 100)}%` }}
                          />
                        </div>
                      </div>
                      <span
                        className={`text-sm font-bold w-20 text-right shrink-0 ${solde >= 0 ? "text-success" : "text-danger"}`}
                      >
                        {solde >= 0 ? "+" : "-"}
                        {format(Math.abs(solde))}
                      </span>
                    </div>
                  );
                })}
              </div>
              {meilleurMois && (
                <div className="bg-success/10 border border-success/20 rounded-xl p-4">
                  <p className="text-xs font-semibold text-success uppercase tracking-wide mb-1">
                    Meilleur mois
                  </p>
                  <p className="text-sm font-bold text-primary">
                    {meilleurMois.month} —{" "}
                    {format(meilleurMois.revenus - meilleurMois.depenses)}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
