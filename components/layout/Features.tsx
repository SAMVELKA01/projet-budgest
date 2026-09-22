"use client";

import { Wallet, LineChart, Target, Trophy, Repeat2, Sparkles } from "lucide-react";

const features = [
  { icon: Wallet, title: "Suivi des transactions", description: "Enregistrez revenus et dépenses en quelques secondes et gardez une vue claire de chaque opération.", iconColor: "text-primary" },
  { icon: LineChart, title: "Analyse par jour, semaine, mois", description: "Visualisez vos habitudes à la granularité qui compte pour vous, et comprenez où va votre argent.", iconColor: "text-primary" },
  { icon: Target, title: "Budgets par catégorie", description: "Fixez des plafonds de dépenses personnalisés et suivez leur progression au centime près.", iconColor: "text-warning" },
  { icon: Trophy, title: "Objectifs d'épargne", description: "Créez des objectifs financiers et suivez votre progression — vacances, achat, ou tranquillité d'esprit.", iconColor: "text-success" },
  { icon: Repeat2, title: "Transactions récurrentes", description: "Loyer, abonnements, salaire — configurez une fois, BudGest s'occupe du reste automatiquement.", iconColor: "text-primary" },
  { icon: Sparkles, title: "Assistant IA intégré", description: "Posez vos questions en langage naturel et recevez des suggestions personnalisées sur votre budget.", iconColor: "text-info" },
];

export default function Features() {
  return (
    <section id="fonctionnalites" className="bg-white py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-xl mb-16">
          <div className="inline-flex items-center gap-2 bg-neutral text-tertiary text-xs font-bold px-4 py-2 rounded-full mb-5">
            Fonctionnalités
          </div>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold text-primary leading-tight mb-4">
            Tout ce qu&apos;il faut, <span className="text-info">rien de superflu</span>
          </h2>
          <p className="text-tertiary text-base leading-relaxed">
            BudGest ne cherche pas à vous impressionner avec des graphiques superflus — chaque outil sert un seul objectif : une vision exacte de votre situation.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => (
            <div key={feature.title} className="hover-lift bg-neutral rounded-3xl p-7">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-5">
                <feature.icon size={22} className={feature.iconColor} strokeWidth={2} />
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">{feature.title}</h3>
              <p className="text-sm text-tertiary leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
