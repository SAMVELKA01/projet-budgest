"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp, ShoppingBag, Home as HomeIcon, Utensils } from "lucide-react";

const stats = [
  { value: "10 000+", label: "Comptes ouverts" },
  { value: "100%", label: "Données privées" },
  { value: "0€", label: "Pour commencer" },
];

const categories = [
  { icon: HomeIcon, label: "Logement", amount: "965,00", pct: 62, colorClass: "bg-violet" },
  { icon: Utensils, label: "Alimentation", amount: "300,00", pct: 38, colorClass: "bg-info" },
  { icon: ShoppingBag, label: "Loisirs", amount: "180,00", pct: 22, colorClass: "bg-warning" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-app pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto relative grid lg:grid-cols-[1fr_460px] gap-14 items-center">
        <div className="reveal">
          <div className="inline-flex items-center gap-2 bg-neutral text-tertiary text-xs font-bold px-4 py-2 rounded-full mb-6">
            <TrendingUp size={14} /> Gestion financière personnelle
          </div>

          <h1 className="text-[clamp(2.2rem,5vw,3.4rem)] font-semibold text-primary leading-[1.08] tracking-tight mb-6">
            Votre argent,<br />
            <span className="text-info">enfin simple</span> à gérer.
          </h1>

          <p className="text-tertiary text-lg leading-relaxed max-w-md mb-9">
            BudGest suit vos revenus, vos dépenses et vos objectifs d&apos;épargne en un coup d&apos;œil — avec un assistant IA qui répond à vos questions sur vos finances.
          </p>

          <div className="flex flex-wrap gap-4 mb-14">
            <Link href="/register" className="inline-flex items-center gap-2 bg-primary text-inverse font-semibold px-7 py-4 rounded-full hover:bg-primary-light transition-colors no-underline">
              Ouvrir un compte gratuit <ArrowRight size={18} />
            </Link>
            <Link href="#fonctionnalites" className="inline-flex items-center gap-2 bg-white text-ink font-semibold px-7 py-4 rounded-full border border-border hover:border-ink/40 transition-colors no-underline">
              Découvrir BudGest
            </Link>
          </div>

          <div className="flex flex-wrap gap-10">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-primary tabular-nums">{stat.value}</div>
                <div className="text-xs text-tertiary mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Carte d'aperçu du tableau de bord — élément signature */}
        <div className="hidden lg:block reveal" style={{ animationDelay: "0.15s" }}>
          <div className="bg-white border border-border rounded-3xl p-6">
            <div className="bg-primary rounded-2xl p-5 text-inverse mb-5">
              <p className="text-xs font-medium text-inverse/70 mb-1 uppercase tracking-wide">Solde total</p>
              <p className="text-3xl font-bold mb-4 tabular-nums">12 450,00 €</p>
              <div className="flex items-center gap-2 text-xs font-semibold bg-inverse/15 w-fit px-3 py-1.5 rounded-full">
                <TrendingUp size={13} /> +8,2% ce mois-ci
              </div>
            </div>

            <p className="text-xs font-semibold text-tertiary uppercase tracking-wide mb-3">Dépenses par catégorie</p>
            <div className="flex flex-col gap-3">
              {categories.map((cat) => (
                <div key={cat.label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-neutral flex items-center justify-center shrink-0">
                    <cat.icon size={16} className="text-ink" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm font-semibold text-ink">{cat.label}</span>
                      <span className="text-sm font-bold text-ink tabular-nums">{cat.amount} €</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-neutral overflow-hidden">
                      <div className={`h-full rounded-full ${cat.colorClass}`} style={{ width: `${cat.pct}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
