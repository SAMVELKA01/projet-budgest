"use client";

import { useState, useEffect } from "react";
import { TrendingDown, Calendar, Tag, Flame } from "lucide-react";

interface TopDepense { name: string; amount: number; category: string; colorHex: string; }

const colorMap: Record<string, string> = {
  Logement: "#3B82F6", Alimentation: "#10B981", Transport: "#F59E0B",
  Loisirs: "#8B5CF6", Abonnements: "#EC4899", Santé: "#64748B",
};

export default function StatistiquesPage() {
  const [loading, setLoading] = useState(true);
  const [topDepenses, setTopDepenses] = useState<TopDepense[]>([]);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [weeklyData, setWeeklyData] = useState<{ day: string; amount: number }[]>([]);
  const [stats, setStats] = useState({ moyenne: 0, dominante: "-", totalTx: 0, epargneStreak: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/stats").then(r => r.ok ? r.json() : null),
      fetch("/api/transactions").then(r => r.ok ? r.json() : []),
    ]).then(([statsData, transactions]) => {
      if (!statsData) return;

      // Top dépenses par catégorie
      const tops = Object.entries(statsData.depensesByCategory || {})
        .map(([name, amount]) => ({
          name,
          amount: amount as number,
          category: name,
          colorHex: colorMap[name] || "#64748B",
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
      setTopDepenses(tops);

      // Dépenses par jour de la semaine
      const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
      const dayTotals = Array(7).fill(0);
      if (Array.isArray(transactions)) {
        transactions.filter((t: any) => t.amount < 0).forEach((t: any) => {
          const day = new Date(t.date).getDay();
          dayTotals[day] += Math.abs(t.amount);
        });
      }
      const weekly = days.map((day, i) => ({ day, amount: Math.round(dayTotals[i]) }));
      setWeeklyData(weekly);

      // Stats générales
      const txList = Array.isArray(transactions) ? transactions : [];
      const depenses = txList.filter((t: any) => t.amount < 0);
      const moyenne = depenses.length > 0
        ? depenses.reduce((s: number, t: any) => s + Math.abs(t.amount), 0) / depenses.length
        : 0;

      const dominante = tops[0]?.name || "-";
      const maxDayIdx = dayTotals.indexOf(Math.max(...dayTotals));
      const maxDay = days[maxDayIdx] || "-";

      setStats({ moyenne: Math.round(moyenne * 100) / 100, dominante, totalTx: txList.length, epargneStreak: 0 });
    }).finally(() => setLoading(false));
  }, []);

  const maxWeekly = Math.max(...weeklyData.map(d => d.amount), 1);
  const maxTopAmount = topDepenses[0]?.amount || 1;

  const insights = [
    { icon: "📊", title: "Transactions totales", desc: `Vous avez enregistré ${stats.totalTx} transaction${stats.totalTx > 1 ? "s" : ""} au total.`, bg: "bg-secondary/10", border: "border-secondary/20", titleColor: "text-secondary" },
    { icon: "🏆", title: "Catégorie dominante", desc: `${stats.dominante} représente votre principale source de dépenses.`, bg: "bg-warning/10", border: "border-warning/20", titleColor: "text-warning" },
    { icon: "💡", title: "Conseil", desc: "Ajoutez des transactions régulièrement pour obtenir des insights personnalisés plus précis.", bg: "bg-success/10", border: "border-success/20", titleColor: "text-success" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>Statistiques</h1>
        <p className="text-tertiary text-sm mt-1">Indicateurs clés et tendances de vos finances.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Transaction moyenne", value: `${stats.moyenne.toFixed(2)} €`, sub: "Par dépense", icon: TrendingDown, iconColor: "text-danger", iconBg: "bg-danger/10" },
          { label: "Total transactions", value: `${stats.totalTx}`, sub: "Toutes confondues", icon: Calendar, iconColor: "text-warning", iconBg: "bg-warning/10" },
          { label: "Catégorie dominante", value: stats.dominante, sub: "Plus grosse dépense", icon: Tag, iconColor: "text-secondary", iconBg: "bg-secondary/10" },
          { label: "Streak d'épargne", value: `${stats.epargneStreak} mois`, sub: "Consécutifs dans le vert", icon: Flame, iconColor: "text-success", iconBg: "bg-success/10" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-tertiary uppercase tracking-wide">{kpi.label}</p>
              <div className={`w-8 h-8 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                <kpi.icon size={15} className={kpi.iconColor} />
              </div>
            </div>
            <p className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>{kpi.value}</p>
            <p className="text-xs text-tertiary mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Graphique par jour */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <h3 className="font-bold text-primary mb-2" style={{ fontFamily: "var(--font-heading)" }}>Dépenses par jour de la semaine</h3>
          <div className="h-5 mb-3">
            {hoveredBar !== null && weeklyData[hoveredBar] && (
              <p className="text-xs text-tertiary">
                {weeklyData[hoveredBar].day} — <span className="text-danger font-semibold">{weeklyData[hoveredBar].amount} €</span>
              </p>
            )}
          </div>
          {weeklyData.every(d => d.amount === 0) ? (
            <div className="h-40 flex items-center justify-center">
              <p className="text-sm text-tertiary">Aucune dépense enregistrée.</p>
            </div>
          ) : (
            <div className="flex items-end gap-2" style={{ height: "160px" }}>
              {weeklyData.map((d, i) => {
                const isMax = d.amount === Math.max(...weeklyData.map(x => x.amount));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer"
                    onMouseEnter={() => setHoveredBar(i)} onMouseLeave={() => setHoveredBar(null)}>
                    <div className="w-full rounded-t-lg transition-all"
                      style={{
                        height: `${(d.amount / maxWeekly) * 130}px`,
                        background: hoveredBar === i ? "#0B1F3A" : isMax ? "#3B82F6" : "rgba(59,130,246,0.25)",
                        minHeight: d.amount > 0 ? "4px" : "0",
                      }} />
                    <span className="text-xs text-tertiary">{d.day}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top dépenses */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <h3 className="font-bold text-primary mb-5" style={{ fontFamily: "var(--font-heading)" }}>Top dépenses par catégorie</h3>
          {topDepenses.length === 0 ? (
            <p className="text-sm text-tertiary">Aucune dépense enregistrée.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {topDepenses.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-tertiary w-4 flex-shrink-0">{i + 1}</span>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: d.colorHex }}>{d.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-primary">{d.name}</span>
                      <span className="text-sm font-bold text-danger">-{d.amount.toFixed(0)} €</span>
                    </div>
                    <div className="w-full bg-neutral rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${(d.amount / maxTopAmount) * 100}%`, background: d.colorHex }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white border border-border rounded-2xl p-6">
        <h3 className="font-bold text-primary mb-5" style={{ fontFamily: "var(--font-heading)" }}>Insights personnalisés</h3>
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