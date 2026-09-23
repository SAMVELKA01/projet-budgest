"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

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
    <section id="faq" className="bg-app py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-neutral text-tertiary text-xs font-bold px-4 py-2 rounded-full mb-5">
            Questions fréquentes
          </div>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold text-primary leading-tight">
            Avant d&apos;ouvrir <span className="text-info">votre compte</span>
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="bg-white border border-border rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-6 py-5 flex justify-between items-center gap-4 text-left"
                >
                  <span className="text-base font-semibold text-ink">{faq.question}</span>
                  <span className={`w-8 h-8 rounded-full bg-neutral text-ink flex items-center justify-center shrink-0 transition-transform ${isOpen ? "rotate-45" : ""}`}>
                    <Plus size={16} />
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6">
                    <p className="text-sm text-tertiary leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
