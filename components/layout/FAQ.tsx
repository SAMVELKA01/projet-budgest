"use client";

import { useState } from "react";

const faqs = [
  { question: "BudGest est-il vraiment gratuit ?", answer: "Oui, le Compte Essentiel est totalement gratuit sans limite de durée. Il inclut 50 transactions par mois, 2 budgets et 1 objectif d'épargne. Vous pouvez passer au Compte Privé à tout moment." },
  { question: "Mes données financières sont-elles sécurisées ?", answer: "Absolument. Toutes vos données sont chiffrées de bout en bout. Nous n'avons jamais accès à vos informations bancaires — vous saisissez uniquement les montants et catégories manuellement." },
  { question: "Puis-je accéder à BudGest depuis mon téléphone ?", answer: "BudGest est entièrement responsive et fonctionne parfaitement sur mobile, tablette et ordinateur depuis votre navigateur. Une application mobile native est prévue dans une prochaine version." },
  { question: "Comment fonctionnent les transactions récurrentes ?", answer: "Vous configurez une transaction récurrente une seule fois (loyer, abonnement, salaire...) avec la fréquence souhaitée. BudGest la génère automatiquement chaque mois dans votre historique." },
  { question: "Puis-je créer mes propres catégories ?", answer: "Oui, vous pouvez créer, personnaliser et budgétiser autant de catégories que vous le souhaitez — plus aucune liste imposée." },
  { question: "Puis-je exporter mes données ?", answer: "Oui, vous pouvez exporter l'intégralité de vos transactions au format CSV depuis la page Transactions à tout moment." },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="landing" style={{ background: "var(--land-paper)", padding: "104px 24px" }}>
      <div style={{ maxWidth: "740px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <div className="landing-eyebrow" style={{ color: "var(--land-forest)", marginBottom: "20px", justifyContent: "center" }}>
            Questions fréquentes
          </div>
          <h2 className="font-display" style={{
            fontSize: "clamp(28px, 3.6vw, 38px)", fontWeight: 500, color: "var(--land-ink)", marginBottom: "14px",
          }}>
            Avant d&apos;ouvrir <em style={{ fontStyle: "italic", color: "var(--land-forest)" }}>votre compte</em>
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {faqs.map((faq, index) => (
            <div key={index} style={{ borderBottom: "1px solid var(--land-line)" }}>
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                style={{
                  width: "100%", padding: "22px 4px", display: "flex", justifyContent: "space-between",
                  alignItems: "center", background: "none", border: "none", cursor: "pointer",
                  textAlign: "left", gap: "16px",
                }}
              >
                <span className="font-display" style={{ fontSize: "16px", fontWeight: 500, color: "var(--land-ink)" }}>
                  {faq.question}
                </span>
                <span style={{
                  color: "var(--land-brass)", fontSize: "20px", lineHeight: 1, fontWeight: 300, flexShrink: 0,
                  transform: openIndex === index ? "rotate(45deg)" : "none", transition: "transform 0.2s",
                }}>+</span>
              </button>
              {openIndex === index && (
                <div style={{ padding: "0 4px 22px" }}>
                  <p style={{ fontSize: "14px", color: "var(--land-muted)", lineHeight: 1.75, maxWidth: "600px" }}>
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
