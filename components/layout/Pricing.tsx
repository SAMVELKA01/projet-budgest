"use client";

import Link from "next/link";

export default function Pricing() {
  const plans = [
    {
      name: "Gratuit", price: "0",
      description: "Parfait pour commencer à gérer votre budget.",
      features: ["Jusqu'à 50 transactions/mois", "2 budgets par catégorie", "1 objectif d'épargne", "Graphiques de base", "Export CSV"],
      cta: "Commencer gratuitement", href: "/register", highlighted: false,
    },
    {
      name: "Pro", price: "4,99",
      description: "Pour une gestion complète et sans limites.",
      features: ["Transactions illimitées", "Budgets illimités", "Objectifs illimités", "Analytique avancée", "Transactions récurrentes", "Export CSV & PDF", "Support prioritaire"],
      cta: "Essayer 30 jours gratuits", href: "/register", highlighted: true,
    },
  ];

  return (
    <section id="tarifs" style={{ background: "#fff", padding: "80px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: "20px", padding: "6px 14px", marginBottom: "20px",
          }}>
            <span style={{ fontSize: "13px", color: "#3B82F6", fontWeight: 500 }}>Tarifs</span>
          </div>
          <h2 style={{
            fontFamily: "var(--font-manrope)", fontWeight: 800, color: "#0B1F3A", marginBottom: "16px",
            fontSize: "clamp(28px, 4vw, 40px)",
          }}>
            Simple et <span style={{ color: "#3B82F6" }}>transparent</span>
          </h2>
          <p style={{ fontSize: "17px", color: "#64748B", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>
            Commencez gratuitement, évoluez quand vous êtes prêt.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px", maxWidth: "800px", margin: "0 auto",
        }}>
          {plans.map((plan) => (
            <div key={plan.name} style={{
              background: plan.highlighted ? "#0B1F3A" : "#fff",
              border: plan.highlighted ? "2px solid #3B82F6" : "1px solid #E2E8F0",
              borderRadius: "20px", padding: "40px", position: "relative",
            }}>
              {plan.highlighted && (
                <div style={{
                  position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)",
                  background: "#3B82F6", color: "#fff", fontSize: "12px", fontWeight: 600,
                  padding: "4px 16px", borderRadius: "20px", whiteSpace: "nowrap",
                }}>Le plus populaire</div>
              )}
              <h3 style={{ fontFamily: "var(--font-manrope)", fontSize: "20px", fontWeight: 700, color: plan.highlighted ? "#fff" : "#0B1F3A", marginBottom: "8px" }}>
                {plan.name}
              </h3>
              <p style={{ fontSize: "14px", color: plan.highlighted ? "#94A3B8" : "#64748B", marginBottom: "24px", lineHeight: 1.6 }}>
                {plan.description}
              </p>
              <div style={{ marginBottom: "32px" }}>
                <span style={{ fontFamily: "var(--font-manrope)", fontSize: "48px", fontWeight: 800, color: plan.highlighted ? "#fff" : "#0B1F3A" }}>
                  {plan.price}€
                </span>
                <span style={{ fontSize: "14px", color: plan.highlighted ? "#94A3B8" : "#64748B", marginLeft: "6px" }}>/ mois</span>
              </div>
              <div style={{ marginBottom: "32px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {plan.features.map((feature) => (
                  <div key={feature} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "18px", height: "18px", borderRadius: "50%", background: "#3B82F6",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <span style={{ color: "#fff", fontSize: "10px", fontWeight: 700 }}>✓</span>
                    </div>
                    <span style={{ fontSize: "14px", color: plan.highlighted ? "#CBD5E1" : "#64748B" }}>{feature}</span>
                  </div>
                ))}
              </div>
              <Link href={plan.href} style={{
                display: "block", textAlign: "center",
                background: plan.highlighted ? "#3B82F6" : "#0B1F3A",
                color: "#fff", textDecoration: "none", padding: "14px",
                borderRadius: "10px", fontSize: "15px", fontWeight: 600,
              }}>{plan.cta}</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}