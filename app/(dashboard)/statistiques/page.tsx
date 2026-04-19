"use client";

import { useState } from "react";
import { TrendingDown, Calendar, Tag, Flame } from "lucide-react";

const weeklyData = [
  { day: "Lun", amount: 45 },
  { day: "Mar", amount: 120 },
  { day: "Mer", amount: 30 },
  { day: "Jeu", amount: 85 },
  { day: "Ven", amount: 210 },
  { day: "Sam", amount: 95 },
  { day: "Dim", amount: 60 },
];

const monthlyData = [
  { day: "01", amount: 120 },
  { day: "05", amount: 850 },
  { day: "08", amount: 67 },
  { day: "10", amount: 9 },
  { day: "15", amount: 1200 },
  { day: "18", amount: 34 },
  { day: "19", amount: 88 },
  { day: "21", amount: 55 },
  { day: "22", amount: 112 },
  { day: "24", amount: 88 },
];

const topDepenses = [
  { name: "Loyer", amount: 850, category: "Logement", colorHex: "#3B82F6" },
  { name: "Courses", amount: 280, category: "Alimentation", colorHex: "#10B981" },
  { name: "EDF", amount: 112, category: "Logement", colorHex: "#3B82F6" },
  { name: "Transport", amount: 122, category: "Transport", colorHex: "#F59E0B" },
  { name: "Restaurants", amount: 95, category: "Loisirs", colorHex: "#8B5CF6" },
];

const insights = [
  {
    icon: "📈",
    title: "Tendance positive",
    desc: "Vos dépenses ont baissé de 8% ce mois par rapport au mois dernier.",
    bg: "bg-success/10",
    border: "border-success/20",
    titleColor: "text-success",
  },
  {
    icon: "⚠️",
    title: "Budget logement dépassé",
    desc: "Vous avez dépassé votre budget logement de 62€ ce mois-ci.",
    bg: "bg-warning/10",
    border: "border-warning/20",
    titleColor: "text-warning",
  },
  {
    icon: "🎯",
    title: "Objectif en bonne voie",
    desc: "Votre fonds d'urgence est à 84%. Encore 800€ et vous l'atteignez.",
    bg: "bg-secondary/10",
    border: "border-secondary/20",
    titleColor: "text-secondary",
  },
];

export default function StatistiquesPage() {
  const [vue, setVue] = useState<"semaine" | "mois">("semaine");
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const data = vue === "semaine" ? weeklyData : monthlyData;
  const maxVal = Math.max(...data.map(d => d.amount));

  const kpis = [
    { label: "Transaction moyenne", value: "87,50 €", sub: "Par opération ce mois", icon: TrendingDown, iconColor: "text-danger", iconBg: "bg-danger/10" },
    { label: "Jour le plus dépensier", value: "Vendredi", sub: "210 € en moyenne", icon: Calendar, iconColor: "text-warning", iconBg: "bg-warning/10" },
    { label: "Catégorie dominante", value: "Logement", sub: "45% du budget total", icon: Tag, iconColor: "text-secondary", iconBg: "bg-secondary/10" },
    { label: "Streak d'épargne", value: "4 mois", sub: "Consécutifs dans le vert", icon: Flame, iconColor: "text-success", iconBg: "bg-success/10" },
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
            Statistiques
          </h1>
          <p className="text-tertiary text-sm mt-1">Indicateurs clés et tendances de vos finances.</p>
        </div>
        <div className="flex gap-1 bg-white border border-border rounded-xl p-1">
          {(["semaine", "mois"] as const).map((v) => (
            <button
              key={v}
              onClick={() => { setVue(v); setHoveredBar(null); }}
              className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-colors capitalize ${
                vue === v ? "bg-primary text-white" : "text-tertiary hover:text-primary"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-tertiary uppercase tracking-wide">{kpi.label}</p>
              <div className={`w-8 h-8 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                <kpi.icon size={15} className={kpi.iconColor} />
              </div>
            </div>
            <p className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
              {kpi.value}
            </p>
            <p className="text-xs text-tertiary mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">

        {/* Graphique dépenses */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
              Dépenses par {vue === "semaine" ? "jour de la semaine" : "jour du mois"}
            </h3>
          </div>
          {hoveredBar !== null && (
            <p className="text-xs text-tertiary mb-4">
              {data[hoveredBar]?.day} — <span className="text-danger font-semibold">{data[hoveredBar]?.amount} €</span>
            </p>
          )}
          {hoveredBar === null && <div className="mb-4 h-4" />}

          <div className="flex items-end gap-2" style={{ height: "160px" }}>
            {data.map((d, i) => {
              const isMax = d.amount === maxVal;
              const isHovered = hoveredBar === i;
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer"
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <div
                    className="w-full rounded-t-lg transition-all"
                    style={{
                      height: `${(d.amount / maxVal) * 130}px`,
                      background: isHovered ? "#0B1F3A" : isMax ? "#3B82F6" : "rgba(59,130,246,0.25)",
                    }}
                  />
                  <span className="text-xs text-tertiary">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top dépenses */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <h3 className="font-bold text-primary mb-5" style={{ fontFamily: "var(--font-heading)" }}>
            Top 5 dépenses du mois
          </h3>
          <div className="flex flex-col gap-4">
            {topDepenses.map((d, i) => (
              <div key={d.name} className="flex items-center gap-3">
                <span className="text-xs font-bold text-tertiary w-4 shrink-0">{i + 1}</span>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ background: d.colorHex }}
                >
                  {d.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-primary">{d.name}</span>
                    <span className="text-sm font-bold text-danger">-{d.amount} €</span>
                  </div>
                  <div className="w-full bg-neutral rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${(d.amount / topDepenses[0].amount) * 100}%`,
                        background: d.colorHex,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white border border-border rounded-2xl p-6">
        <h3 className="font-bold text-primary mb-5" style={{ fontFamily: "var(--font-heading)" }}>
          Insights personnalisés
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {insights.map((insight) => (
            <div key={insight.title} className={`${insight.bg} border ${insight.border} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{insight.icon}</span>
                <p className={`text-sm font-bold ${insight.titleColor}`}>{insight.title}</p>
              </div>
              <p className="text-xs text-tertiary leading-relaxed">{insight.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}