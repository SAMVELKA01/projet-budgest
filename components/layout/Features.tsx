"use client";

import { Wallet, LineChart, Target, Trophy, Repeat2, ShieldCheck } from "lucide-react";

const features = [
  { icon: Wallet, title: "Suivi des transactions", description: "Enregistrez revenus et dépenses en quelques secondes. Chaque opération est consignée et catégorisée, comme sur un relevé bancaire." },
  { icon: LineChart, title: "Analyse par jour, semaine, mois", description: "Visualisez vos habitudes à la granularité qui compte pour vous. Comprenez précisément où va votre argent, et quand." },
  { icon: Target, title: "Budgets par catégorie", description: "Fixez des plafonds de dépenses par catégorie personnalisée et suivez leur progression au centime près." },
  { icon: Trophy, title: "Objectifs d'épargne", description: "Créez des objectifs financiers et suivez votre progression. Vacances, achat, retraite — tout est possible." },
  { icon: Repeat2, title: "Transactions récurrentes", description: "Loyer, abonnements, salaire — configurez une fois, BudGest s'occupe du reste automatiquement." },
  { icon: ShieldCheck, title: "Confidentialité totale", description: "Vos données sont chiffrées et ne quittent jamais nos serveurs. Aucun accès à vos comptes bancaires réels." },
];

export default function Features() {
  return (
    <section id="methode" className="landing" style={{ background: "var(--land-parchment)", padding: "104px 24px" }}>
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <div style={{ maxWidth: "620px", marginBottom: "64px" }}>
          <div className="landing-eyebrow" style={{ color: "var(--land-forest)", marginBottom: "20px" }}>
            La méthode
          </div>
          <h2 className="font-display" style={{
            fontWeight: 500, color: "var(--land-ink)", marginBottom: "18px",
            fontSize: "clamp(28px, 3.6vw, 38px)", lineHeight: 1.2,
          }}>
            Six instruments, une seule <em style={{ fontStyle: "italic", color: "var(--land-forest)" }}>discipline</em>
          </h2>
          <p style={{ fontSize: "16px", color: "var(--land-muted)", lineHeight: 1.75 }}>
            BudGest ne cherche pas à impressionner avec des graphiques superflus.
            Chaque instrument sert un seul objectif : une vision exacte de votre situation.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1px", background: "var(--land-line)",
          border: "1px solid var(--land-line)",
        }}>
          {features.map((feature) => (
            <div key={feature.title} className="landing-hover-lift" style={{
              background: "var(--land-paper)", padding: "32px", position: "relative",
            }}>
              <div style={{
                width: "42px", height: "42px", border: "1px solid var(--land-brass)", borderRadius: "3px",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "22px",
              }}>
                <feature.icon size={18} color="var(--land-forest)" strokeWidth={1.5} />
              </div>
              <h3 className="font-display" style={{ fontSize: "17px", fontWeight: 500, color: "var(--land-ink)", marginBottom: "10px" }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: "13.5px", color: "var(--land-muted)", lineHeight: 1.7 }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
