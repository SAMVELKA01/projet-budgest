"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Receipt, 
  Target, 
  PieChart, 
  TrendingUp, 
  Activity,
  UserPlus,
  ArrowRight
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AdminStats {
  stats: {
    totalUsers: number;
    totalTransactions: number;
    totalBudgets: number;
    totalObjectifs: number;
    totalVolume: number;
  };
  recentUsers: {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
  }[];
  dailyStats: { _id: string; count: number }[];
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session && session.user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session && session.user.role === "admin") {
      fetch("/api/admin/stats")
        .then((res) => res.json())
        .then((json) => {
          setData(json);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-tertiary">Chargement du panel admin...</p>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: "Utilisateurs", value: data?.stats.totalUsers, icon: Users, iconColor: "text-primary" },
    { label: "Transactions", value: data?.stats.totalTransactions, icon: Receipt, iconColor: "text-info" },
    { label: "Budgets", value: data?.stats.totalBudgets, icon: PieChart, iconColor: "text-warning" },
    { label: "Objectifs", value: data?.stats.totalObjectifs, icon: Target, iconColor: "text-violet" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] font-semibold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
          Dashboard Administrateur
        </h1>
        <p className="text-sm text-tertiary">Aperçu global de l&apos;activité de la plateforme Budgest.</p>
      </div>

      {/* KPI Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-medium text-tertiary uppercase tracking-wider">{kpi.label}</p>
              <div className="w-8 h-8 rounded-xl bg-neutral flex items-center justify-center">
                <kpi.icon size={16} className={kpi.iconColor} />
              </div>
            </div>
            <p className="text-3xl font-bold text-primary tabular-nums">
              {kpi.value?.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users List */}
        <div className="lg:col-span-2 bg-white border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <UserPlus className="text-primary" size={20} />
              <h2 className="text-lg font-semibold text-primary">Nouveaux utilisateurs</h2>
            </div>
            <Link href="/admin/users" className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1 no-underline">
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-xs font-semibold text-tertiary uppercase">Utilisateur</th>
                  <th className="pb-3 text-xs font-semibold text-tertiary uppercase">Email</th>
                  <th className="pb-3 text-xs font-semibold text-tertiary uppercase">Date d&apos;inscription</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.recentUsers.map((user) => (
                  <tr key={user._id} className="group hover:bg-neutral/50 transition-colors">
                    <td className="py-4 text-sm font-medium text-primary">{user.name}</td>
                    <td className="py-4 text-sm text-tertiary">{user.email}</td>
                    <td className="py-4 text-sm text-tertiary">
                      {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Activity / Quick Stats */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-primary" size={20} />
            <h2 className="text-lg font-semibold text-primary">Activité Système</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-tertiary">Volume de transactions</span>
                <span className="text-sm font-bold text-primary">{(data?.stats.totalVolume || 0).toLocaleString()} €</span>
              </div>
              <div className="w-full h-2 bg-neutral rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-3/4 rounded-full" />
              </div>
            </div>

            <div className="bg-neutral rounded-xl p-4">
              <h3 className="text-[11px] font-medium text-tertiary uppercase tracking-wider mb-3">Tendance Inscriptions</h3>
              <div className="flex items-end gap-1 h-20">
                {data?.dailyStats.map((stat, i) => {
                  const max = Math.max(...(data?.dailyStats.map(d => d.count) || [1]));
                  const height = `${(stat.count / max) * 100}%`;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <div 
                        className="w-full bg-secondary/20 group-hover:bg-secondary rounded-sm transition-all" 
                        style={{ height }}
                        title={`${stat._id}: ${stat.count} inscrits`}
                      />
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-center text-tertiary mt-2 italic">7 derniers jours</p>
            </div>

            <div className="space-y-3">
              <button className="w-full py-2.5 bg-primary text-inverse text-xs font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                <TrendingUp size={14} />
                Générer un rapport PDF
              </button>
              <button className="w-full py-2.5 bg-neutral text-primary text-xs font-bold rounded-xl hover:bg-neutral-dark transition-all">
                Paramètres globaux
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
