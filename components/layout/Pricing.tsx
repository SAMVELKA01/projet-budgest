"use client";

import Link from "next/link";

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
    <section id="tarifs" className="landing" style={{ background: "var(--land-paper)", padding: "104px 24px" }}>
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <div className="landing-eyebrow" style={{ color: "var(--land-forest)", marginBottom: "20px", justifyContent: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ width: "22px", height: "1px", background: "currentColor", opacity: 0.6, display: "inline-block" }} />
              Tarifs
            </span>
          </div>
          <h2 className="font-display" style={{
            fontWeight: 500, color: "var(--land-ink)", marginBottom: "16px",
            fontSize: "clamp(28px, 3.6vw, 38px)",
          }}>
            Deux types de <em style={{ fontStyle: "italic", color: "var(--land-forest)" }}>comptes</em>
          </h2>
          <p style={{ fontSize: "16px", color: "var(--land-muted)", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>
            Commencez gratuitement, passez au Compte Privé quand vous êtes prêt.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px", maxWidth: "820px", margin: "0 auto",
        }}>
          {plans.map((plan) => (
            <div key={plan.name} style={{
              background: plan.highlighted ? "var(--land-ink)" : "var(--land-paper)",
              border: plan.highlighted ? "1px solid var(--land-brass)" : "1px solid var(--land-line)",
              borderRadius: "6px", padding: "40px", position: "relative",
            }}>
              {plan.highlighted && (
                <div style={{
                  position: "absolute", top: "-1px", right: "-1px",
                  background: "var(--land-brass)", color: "var(--land-ink)", fontSize: "10px", fontWeight: 600,
                  padding: "5px 14px", letterSpacing: "0.06em", borderRadius: "0 6px 0 6px",
                }}>RECOMMANDÉ</div>
              )}
              <h3 className="font-display" style={{
                fontSize: "19px", fontWeight: 500,
                color: plan.highlighted ? "#FBFAF6" : "var(--land-ink)", marginBottom: "8px",
              }}>{plan.name}</h3>
              <p style={{
                fontSize: "13.5px", marginBottom: "28px", lineHeight: 1.6,
                color: plan.highlighted ? "#9CA79C" : "var(--land-muted)",
              }}>{plan.description}</p>
              <div style={{ marginBottom: "32px", display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span className="font-mono" style={{
                  fontSize: "40px", fontWeight: 500,
                  color: plan.highlighted ? "#FBFAF6" : "var(--land-ink)",
                }}>{plan.price} €</span>
                <span style={{ fontSize: "13px", color: plan.highlighted ? "#9CA79C" : "var(--land-muted)" }}>/ mois</span>
              </div>
              <div style={{ marginBottom: "32px", display: "flex", flexDirection: "column", gap: "13px" }}>
                {plan.features.map((feature) => (
                  <div key={feature} style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                    <span style={{ color: "var(--land-brass)", fontSize: "12px", flexShrink: 0 }}>—</span>
                    <span style={{ fontSize: "13.5px", color: plan.highlighted ? "#D6DAD3" : "var(--land-muted)" }}>{feature}</span>
                  </div>
                ))}
              </div>
              <Link href={plan.href} style={{
                display: "block", textAlign: "center",
                background: plan.highlighted ? "var(--land-brass)" : "var(--land-ink)",
                color: plan.highlighted ? "var(--land-ink)" : "#FBFAF6",
                textDecoration: "none", padding: "14px", borderRadius: "3px",
                fontSize: "14px", fontWeight: 600, letterSpacing: "0.01em",
              }}>{plan.cta}</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
