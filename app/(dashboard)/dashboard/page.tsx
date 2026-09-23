"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Target,
  PieChart,
  Plus,
  Tag,
  Trophy,
} from "lucide-react";
import { useDevise } from "@/lib/context/DeviseContext";
import TrendBadge from "@/components/ui/TrendBadge";

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

interface Categorie {
  _id: string;
  name: string;
  icon: string;
  colorHex: string;
}

interface Budget {
  _id: string;
  categorieId: string;
  category: string;
  allocated: number;
  alertAt: number;
}

interface Objectif {
  _id: string;
  title: string;
  emoji: string;
  target: number;
  saved: number;
  colorHex: string;
}

const repartitionColors: Record<string, string> = {
  Logement: "#8B7CF6",
  Alimentation: "#5B8DEF",
  Transport: "#E8A33D",
  Loisirs: "#E15B5B",
  Abonnements: "#5B8DEF",
  Santé: "#4CAF7D",
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const { format } = useDevise();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      router.replace("/admin");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      Promise.all([
        fetch("/api/dashboard/stats").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/categories").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/budgets").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/objectifs").then((r) => (r.ok ? r.json() : [])),
      ])
        .then(([statsData, catsData, budgetsData, objectifsData]) => {
          if (statsData) setStats(statsData);
          if (Array.isArray(catsData)) setCategories(catsData);
          if (Array.isArray(budgetsData)) setBudgets(budgetsData);
          if (Array.isArray(objectifsData)) setObjectifs(objectifsData);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, session]);

  const maxVal = stats?.monthlyEvolution
    ? Math.max(...stats.monthlyEvolution.map((d) => Math.max(d.revenus, d.depenses)))
    : 0;

  const repartition = stats?.depensesByCategory
    ? Object.entries(stats.depensesByCategory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([label, amount]) => {
          const cat = categories.find((c) => c.name === label);
          return {
            label,
            amount: amount as number,
            pct: Math.round(((amount as number) / (stats.depenses || 1)) * 100),
            colorHex: cat?.colorHex || repartitionColors[label] || "#9A9CA5",
            icon: cat?.icon || "🏷️",
          };
        })
    : [];

  const tauxEpargne = stats && stats.revenus > 0
    ? Math.round(((stats.revenus - stats.depenses) / stats.revenus) * 100)
    : 0;

  const moyenneMensuelle = stats?.monthlyEvolution.length
    ? stats.monthlyEvolution.reduce((s, m) => s + (m.revenus - m.depenses), 0) / stats.monthlyEvolution.length
    : 0;
  const meilleurMois = stats?.monthlyEvolution.length
    ? [...stats.monthlyEvolution].sort((a, b) => (b.revenus - b.depenses) - (a.revenus - a.depenses))[0]
    : null;

  const budgetsPreview = budgets
    .map((b) => {
      const cat = categories.find((c) => c._id === b.categorieId);
      const spent = stats?.depensesByCategory[b.category] || 0;
      return { ...b, spent, pct: Math.min((spent / b.allocated) * 100, 100), icon: cat?.icon || "📦", colorHex: cat?.colorHex || "#9A9CA5" };
    })
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3);

  const objectifsPreview = [...objectifs]
    .sort((a, b) => b.saved / b.target - a.saved / a.target)
    .slice(0, 2);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-tertiary">Chargement de vos données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Alerte */}
      {stats && stats.evolutionDepenses > 10 && (
        <div className="bg-pastel-olive rounded-2xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center shrink-0">
              <AlertTriangle size={16} className="text-ink" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">
                Attention, vos dépenses augmentent ce mois-ci
              </p>
              <p className="text-xs text-ink/60 mt-0.5">
                +{stats.evolutionDepenses}% par rapport au mois dernier
              </p>
            </div>
          </div>
          <Link href="/transactions" className="text-xs font-semibold text-ink no-underline hover:underline whitespace-nowrap">
            Voir les détails →
          </Link>
        </div>
      )}

      {/* KPIs héros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-pastel-sand rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-medium text-ink/60 uppercase tracking-wider">Solde total</p>
            <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center">
              <Wallet size={15} className="text-ink" />
            </div>
          </div>
          <p className="text-4xl font-bold text-ink tabular-nums">{format(stats?.solde || 0)}</p>
          <div className="flex items-center gap-1.5 mt-3">
            <TrendBadge value={stats?.evolutionRevenus || 0} />
            <span className="text-xs text-ink/50">depuis le mois dernier</span>
          </div>
        </div>

        <div className="bg-pastel-sage rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-medium text-ink/60 uppercase tracking-wider">Revenus ce mois</p>
            <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center">
              <TrendingUp size={15} className="text-ink" />
            </div>
          </div>
          <p className="text-4xl font-bold text-ink tabular-nums">{format(stats?.revenus || 0)}</p>
          <div className="flex items-center gap-1.5 mt-3">
            <TrendBadge value={stats?.evolutionRevenus || 0} />
            <span className="text-xs text-ink/50">vs mois dernier</span>
          </div>
        </div>

        <div className="bg-pastel-mauve rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-medium text-ink/60 uppercase tracking-wider">Dépenses</p>
            <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center">
              <TrendingDown size={15} className="text-ink" />
            </div>
          </div>
          <p className="text-4xl font-bold text-ink tabular-nums">{format(stats?.depenses || 0)}</p>
          <div className="flex items-center gap-1.5 mt-3">
            <TrendBadge value={-(stats?.evolutionDepenses || 0)} />
            <span className="text-xs text-ink/50">vs mois dernier</span>
          </div>
        </div>

        <div className="bg-pastel-olive rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-medium text-ink/60 uppercase tracking-wider">Taux d&apos;épargne</p>
            <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center">
              <PiggyBank size={15} className="text-ink" />
            </div>
          </div>
          <p className="text-4xl font-bold text-ink tabular-nums">{tauxEpargne}%</p>
          <div className="flex items-center gap-1.5 mt-3">
            <span className="text-xs text-ink/50">du revenu total ce mois</span>
          </div>
        </div>
      </div>

      {/* Bandeau Assistant IA */}
      <Link href="/assistant" className="no-underline bg-ink rounded-2xl px-5 py-4 flex items-center justify-between gap-4 hover:opacity-90 transition-opacity">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center shrink-0">
            <Sparkles size={17} className="text-ink" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Demandez à l&apos;assistant IA</p>
            <p className="text-xs text-white/60 mt-0.5 truncate">
              {tauxEpargne >= 20
                ? `Bonne nouvelle : vous épargnez ${tauxEpargne}% de vos revenus ce mois-ci.`
                : stats && stats.evolutionDepenses > 10
                  ? `Vos dépenses ont augmenté de ${stats.evolutionDepenses}% — demandez une analyse détaillée.`
                  : "Suggestions personnalisées, prévisions et réponses sur vos finances."}
            </p>
          </div>
        </div>
        <ArrowUpRight size={16} className="text-white/60 shrink-0" />
      </Link>

      {/* Évolution mensuelle + résumé */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-ink" style={{ fontFamily: "var(--font-heading)" }}>Évolution Mensuelle</h3>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-tertiary bg-neutral px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-success" /> Revenus
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-tertiary bg-neutral px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-danger" /> Dépenses
              </span>
            </div>
          </div>

          <div className="h-5 mb-3">
            {hoveredBar !== null && stats && (
              <p className="text-xs text-tertiary">
                {stats.monthlyEvolution[hoveredBar]?.month} —{" "}
                <span className="text-success font-semibold">{format(stats.monthlyEvolution[hoveredBar]?.revenus || 0)}</span>
                {" · "}
                <span className="text-danger font-semibold">{format(stats.monthlyEvolution[hoveredBar]?.depenses || 0)}</span>
              </p>
            )}
          </div>

          <div className="flex items-end gap-3" style={{ height: "140px" }}>
            {stats?.monthlyEvolution.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 cursor-pointer"
                onMouseEnter={() => setHoveredBar(i)} onMouseLeave={() => setHoveredBar(null)}>
                <div className="w-full flex gap-0.5 items-end" style={{ height: "120px" }}>
                  <div className="flex-1 rounded-t-md transition-all"
                    style={{ height: `${maxVal > 0 ? (d.revenus / maxVal) * 100 : 0}%`, background: hoveredBar === i ? "#4CAF7D" : "rgba(76,175,125,0.45)" }} />
                  <div className="flex-1 rounded-t-md transition-all"
                    style={{ height: `${maxVal > 0 ? (d.depenses / maxVal) * 100 : 0}%`, background: hoveredBar === i ? "#E15B5B" : "rgba(225,91,91,0.4)" }} />
                </div>
                <span className="text-xs text-tertiary">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-pastel-mauve rounded-2xl p-5 flex flex-col gap-4">
          <h3 className="font-semibold text-ink" style={{ fontFamily: "var(--font-heading)" }}>Résumé rapide</h3>
          <div>
            <p className="text-[11px] font-medium text-ink/60 uppercase tracking-wider mb-1">Solde moyen / mois</p>
            <p className={`text-2xl font-bold tabular-nums ${moyenneMensuelle >= 0 ? "text-success" : "text-danger"}`}>
              {moyenneMensuelle >= 0 ? "+" : ""}{format(moyenneMensuelle)}
            </p>
          </div>
          {meilleurMois && (
            <div>
              <p className="text-[11px] font-medium text-ink/60 uppercase tracking-wider mb-1">Meilleur mois</p>
              <p className="text-lg font-bold text-ink">{meilleurMois.month}</p>
              <p className="text-xs text-success font-semibold tabular-nums">
                +{format(meilleurMois.revenus - meilleurMois.depenses)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Répartition + Budgets en cours + Objectifs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Répartition */}
        <div className="bg-white border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-ink mb-4" style={{ fontFamily: "var(--font-heading)" }}>Répartition</h3>
          <div className="flex justify-center mb-5">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#ECEAE2" strokeWidth="3.5" />
                {repartition.map((item, i) => {
                  const offset = repartition.slice(0, i).reduce((s, r) => s + r.pct, 0);
                  return (
                    <circle key={item.label} cx="18" cy="18" r="15.9" fill="none" stroke={item.colorHex} strokeWidth="3.5"
                      strokeDasharray={`${item.pct} ${100 - item.pct}`} strokeDashoffset={`-${offset}`} strokeLinecap="round" />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-ink">{format(stats?.depenses || 0)}</span>
                <span className="text-xs text-tertiary">total</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {repartition.length === 0 && <p className="text-xs text-tertiary text-center">Aucune dépense ce mois-ci.</p>}
            {repartition.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0" style={{ background: `${item.colorHex}22` }}>
                  {item.icon}
                </div>
                <span className="text-xs text-ink/70 flex-1 truncate">{item.label}</span>
                <span className="text-xs font-bold text-ink w-8 text-right">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Budgets en cours */}
        <div className="bg-pastel-sage rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
              <PieChart size={16} /> Budgets en cours
            </h3>
            <Link href="/budgets" className="text-xs font-semibold text-ink/60 no-underline hover:underline">Voir tout</Link>
          </div>
          {budgetsPreview.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-4">
              <p className="text-xs text-ink/60">Aucun budget créé pour ce mois.</p>
              <Link href="/budgets" className="text-xs font-semibold text-ink no-underline hover:underline">Créer un budget →</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {budgetsPreview.map((b) => (
                <div key={b._id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-ink truncate">{b.icon} {b.category}</span>
                    <span className="text-xs text-ink/60 tabular-nums">{format(b.spent)} / {format(b.allocated)}</span>
                  </div>
                  <div className="w-full bg-white/50 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${b.pct}%`, background: b.pct >= 100 ? "#E15B5B" : b.pct >= 80 ? "#E8A33D" : "#1E5C34" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Objectifs d'épargne */}
        <div className="bg-pastel-sand rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
              <Target size={16} /> Objectifs d&apos;épargne
            </h3>
            <Link href="/objectifs" className="text-xs font-semibold text-ink/60 no-underline hover:underline">Voir tout</Link>
          </div>
          {objectifsPreview.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-4">
              <p className="text-xs text-ink/60">Aucun objectif créé pour le moment.</p>
              <Link href="/objectifs" className="text-xs font-semibold text-ink no-underline hover:underline">Créer un objectif →</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {objectifsPreview.map((o) => {
                const pct = Math.min((o.saved / o.target) * 100, 100);
                return (
                  <div key={o._id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-ink truncate">{o.emoji} {o.title}</span>
                      <span className="text-xs font-bold text-ink">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-white/50 rounded-full h-2">
                      <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: o.colorHex }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link href="/transactions" className="no-underline bg-white border border-border rounded-2xl p-4 flex flex-col items-center gap-2 text-center hover:border-ink/20 transition-colors">
          <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center"><Plus size={18} className="text-ink" /></div>
          <span className="text-xs font-semibold text-ink">Ajouter une transaction</span>
        </Link>
        <Link href="/budgets" className="no-underline bg-white border border-border rounded-2xl p-4 flex flex-col items-center gap-2 text-center hover:border-ink/20 transition-colors">
          <div className="w-10 h-10 rounded-full bg-pastel-sage flex items-center justify-center"><PieChart size={18} className="text-ink" /></div>
          <span className="text-xs font-semibold text-ink">Créer un budget</span>
        </Link>
        <Link href="/objectifs" className="no-underline bg-white border border-border rounded-2xl p-4 flex flex-col items-center gap-2 text-center hover:border-ink/20 transition-colors">
          <div className="w-10 h-10 rounded-full bg-pastel-mauve flex items-center justify-center"><Trophy size={18} className="text-ink" /></div>
          <span className="text-xs font-semibold text-ink">Créer un objectif</span>
        </Link>
        <Link href="/categories" className="no-underline bg-white border border-border rounded-2xl p-4 flex flex-col items-center gap-2 text-center hover:border-ink/20 transition-colors">
          <div className="w-10 h-10 rounded-full bg-pastel-olive flex items-center justify-center"><Tag size={18} className="text-ink" /></div>
          <span className="text-xs font-semibold text-ink">Nouvelle catégorie</span>
        </Link>
      </div>

      {/* Transactions récentes */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-ink" style={{ fontFamily: "var(--font-heading)" }}>Transactions Récentes</h3>
          <Link href="/transactions" className="text-xs font-semibold text-ink no-underline hover:underline flex items-center gap-1">
            Voir tout <ArrowUpRight size={12} />
          </Link>
        </div>

        {stats?.recentTransactions.length === 0 ? (
          <div className="px-5 py-10 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-neutral flex items-center justify-center">
              <Wallet size={20} className="text-tertiary" />
            </div>
            <p className="text-sm text-tertiary">Aucune transaction pour le moment.</p>
            <Link href="/transactions" className="inline-flex items-center gap-1.5 text-xs text-white bg-ink font-semibold no-underline px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
              <Plus size={12} /> Ajouter une transaction
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {stats?.recentTransactions.map((t) => {
              const cat = categories.find((c) => c.name === t.category);
              return (
                <div key={t._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-neutral/50 transition-colors">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0" style={{ background: `${cat?.colorHex || "#9A9CA5"}22` }}>
                    {cat?.icon || t.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{t.name}</p>
                    <p className="text-xs text-tertiary">{new Date(t.date).toLocaleDateString("fr-FR")} · {t.method}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${t.category === "Revenus" ? "bg-success/10 text-success" : "bg-neutral text-tertiary"}`}>
                    {t.category}
                  </span>
                  <span className={`text-sm font-bold w-24 text-right shrink-0 tabular-nums ${t.amount > 0 ? "text-success" : "text-danger"}`}>
                    {t.amount > 0 ? "+" : ""}{format(Math.abs(t.amount))}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
