"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  BarChart2,
  PieChart,
  Tag,
  Settings,
  Plus,
  User,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Budgets", href: "/budgets", icon: PieChart },
  { label: "Objectifs", href: "/objectifs", icon: Target },
  { label: "Analytique", href: "/analytique", icon: BarChart2 },
  { label: "Statistiques", href: "/statistiques", icon: BarChart2 },
  { label: "Catégories", href: "/categories", icon: Tag },
  { label: "Paramètres", href: "/parametres", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen flex flex-col bg-primary shrink-0">

      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
          B
        </div>
        <span className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-heading)" }}>
          BudGest
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all no-underline ${
                isActive
                  ? "bg-secondary text-white"
                  : "text-white/50 hover:text-white hover:bg-white/10"
              }`}
            >
              <IconComponent size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bouton nouvelle transaction */}
      <div className="px-3 pb-4">
        <button className="w-full bg-secondary text-white py-3 rounded-xl text-sm font-semibold hover:bg-secondary-hover transition-colors flex items-center justify-center gap-2">
          <Plus size={16} />
          Nouvelle transaction
        </button>
      </div>

      {/* User */}
      <div className="px-3 py-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/05 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <User size={14} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">Utilisateur</p>
            <p className="text-white/40 text-xs truncate">Mon compte</p>
          </div>
          <button
            title="Se déconnecter"
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white/30 hover:text-danger hover:bg-danger/15 transition-all shrink-0"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

    </aside>
  );
}