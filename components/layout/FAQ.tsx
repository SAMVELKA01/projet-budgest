"use client";

import { useState } from "react";

const faqs = [
  {
    question: "BudGest est-il vraiment gratuit ?",
    answer: "Oui, le plan gratuit est totalement gratuit sans limite de durée. Il inclut 50 transactions par mois, 2 budgets et 1 objectif d'épargne. Vous pouvez passer au plan Pro à tout moment pour débloquer toutes les fonctionnalités.",
  },
  {
    question: "Mes données financières sont-elles sécurisées ?",
    answer: "Absolument. Toutes vos données sont chiffrées de bout en bout. Nous n'avons jamais accès à vos informations bancaires — vous saisissez uniquement les montants et catégories manuellement.",
  },
  {
    question: "Puis-je accéder à BudGest depuis mon téléphone ?",
    answer: "BudGest est entièrement responsive et fonctionne parfaitement sur mobile, tablette et ordinateur depuis votre navigateur. Une application mobile native est prévue dans une prochaine version.",
  },
  {
    question: "Comment fonctionnent les transactions récurrentes ?",
    answer: "Vous configurez une transaction récurrente une seule fois (loyer, abonnement Netflix, salaire...) avec la fréquence souhaitée. BudGest la génère automatiquement chaque mois dans votre historique.",
  },
  {
    question: "Puis-je exporter mes données ?",
    answer: "Oui, vous pouvez exporter l'intégralité de vos transactions au format CSV depuis la page Transactions. Le plan Pro inclut également l'export PDF avec vos graphiques et analyses.",
  },
  {
    question: "Comment annuler mon abonnement Pro ?",
    answer: "Vous pouvez annuler votre abonnement à tout moment depuis la page Paramètres de votre compte. Vous continuez à bénéficier du plan Pro jusqu'à la fin de la période payée.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" style={{
      background: "#fff",
      padding: "100px 24px",
    }}>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(59, 130, 246, 0.08)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            borderRadius: "20px",
            padding: "6px 14px",
            marginBottom: "20px",
          }}>
            <span style={{ fontSize: "13px", color: "#3B82F6", fontWeight: 500 }}>FAQ</span>
          </div>
          <h2 style={{
            fontFamily: "var(--font-manrope)",
            fontSize: "40px",
            fontWeight: 800,
            color: "#0B1F3A",
            marginBottom: "16px",
          }}>
            Questions <span style={{ color: "#3B82F6" }}>fréquentes</span>
          </h2>
          <p style={{
            fontSize: "17px",
            color: "#64748B",
            lineHeight: 1.7,
          }}>
            Tout ce que vous devez savoir sur BudGest.
          </p>
        </div>

        {/* Questions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {faqs.map((faq, index) => (
            <div key={index} style={{
              border: "1px solid",
              borderColor: openIndex === index ? "#3B82F6" : "#E2E8F0",
              borderRadius: "12px",
              overflow: "hidden",
              transition: "border-color 0.2s",
            }}>
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                style={{
                  width: "100%",
                  padding: "20px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  gap: "16px",
                }}
              >
                <span style={{
                  fontFamily: "var(--font-manrope)",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#0B1F3A",
                }}>
                  {faq.question}
                </span>
                <div style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: openIndex === index ? "#3B82F6" : "#F1F5F9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "background 0.2s",
                }}>
                  <span style={{
                    color: openIndex === index ? "#fff" : "#64748B",
                    fontSize: "18px",
                    lineHeight: 1,
                    fontWeight: 300,
                  }}>
                    {openIndex === index ? "−" : "+"}
                  </span>
                </div>
              </button>

              {openIndex === index && (
                <div style={{
                  padding: "0 24px 20px",
                }}>
                  <p style={{
                    fontSize: "14px",
                    color: "#64748B",
                    lineHeight: 1.75,
                    margin: 0,
                  }}>
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