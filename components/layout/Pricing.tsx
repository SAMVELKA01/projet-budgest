"use client";

import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Compte Essentiel", price: "0",
    description: "Pour prendre en main votre budget, sans engagement.",
    features: ["Jusqu'à 50 transactions / mois", "2 budgets par catégorie", "1 objectif d'épargne", "Vues jour / semaine / mois", "Export CSV"],
    cta: "Ouvrir un compte gratuit", href: "/register", highlighted: false,
  },
  {
    name: "Compte Privé", price: "4,99",
    description: "Pour une tenue de comptes complète et sans limites.",
    features: ["Transactions illimitées", "Budgets & objectifs illimités", "Catégories personnalisées illimitées", "Transactions récurrentes", "Export CSV & PDF", "Support prioritaire"],
    cta: "Essayer 30 jours", href: "/register", highlighted: true,
  },
];

export default function Pricing() {
  return (
    <section id="tarifs" className="bg-app py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-lg mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-neutral text-tertiary text-xs font-bold px-4 py-2 rounded-full mb-5">
            Tarifs
          </div>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold text-primary leading-tight mb-4">
            Deux façons de <span className="text-info">commencer</span>
          </h2>
          <p className="text-tertiary text-base leading-relaxed">
            Commencez gratuitement, passez au Compte Privé quand vous êtes prêt.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-9 relative ${plan.highlighted ? "bg-primary text-inverse" : "bg-white border border-border"}`}
            >
              {plan.highlighted && (
                <div className="absolute top-6 right-6 bg-inverse/15 text-inverse text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wide">
                  RECOMMANDÉ
                </div>
              )}
              <h3 className={`text-lg font-semibold mb-2 ${plan.highlighted ? "text-inverse" : "text-ink"}`}>{plan.name}</h3>
              <p className={`text-sm mb-7 leading-relaxed ${plan.highlighted ? "text-inverse/75" : "text-tertiary"}`}>{plan.description}</p>
              <div className="flex items-baseline gap-1.5 mb-8">
                <span className={`text-4xl font-bold tabular-nums ${plan.highlighted ? "text-inverse" : "text-ink"}`}>{plan.price} €</span>
                <span className={`text-sm ${plan.highlighted ? "text-inverse/75" : "text-tertiary"}`}>/ mois</span>
              </div>
              <div className="flex flex-col gap-3.5 mb-8">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2.5">
                    <Check size={15} className={`shrink-0 ${plan.highlighted ? "text-inverse" : "text-ink"}`} />
                    <span className={`text-sm ${plan.highlighted ? "text-inverse/90" : "text-tertiary"}`}>{feature}</span>
                  </div>
                ))}
              </div>
              <Link
                href={plan.href}
                className={`block text-center py-3.5 rounded-full text-sm font-bold no-underline transition-opacity hover:opacity-90 ${plan.highlighted ? "bg-inverse text-primary" : "bg-primary text-inverse"}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
