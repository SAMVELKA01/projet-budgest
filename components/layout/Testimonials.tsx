"use client";

const avatarColors = ["bg-info", "bg-violet", "bg-success"];

const testimonials = [
  { name: "Sophie Martin", role: "Freelance designer", avatar: "SM", content: "BudGest a complètement changé ma façon de gérer mes finances. En tant que freelance, je jonglais entre plusieurs sources de revenus — maintenant tout est clair en un coup d'œil." },
  { name: "Karim Benali", role: "Ingénieur logiciel", avatar: "KB", content: "L'interface est incroyablement propre. Les vues par semaine m'ont aidé à identifier que je dépensais 40% de mon budget en restaurants sans m'en rendre compte." },
  { name: "Léa Rousseau", role: "Étudiante en master", avatar: "LR", content: "Avec un budget serré d'étudiante, BudGest m'aide à tenir mes objectifs d'épargne chaque mois. Simple, efficace, gratuit pour commencer." },
  { name: "Thomas Dupont", role: "Chef de projet", avatar: "TD", content: "J'ai testé beaucoup d'apps de budget. BudGest est la seule que j'utilise encore après 6 mois. Les catégories personnalisées sont une vraie révélation." },
  { name: "Amina Diallo", role: "Médecin", avatar: "AD", content: "Entre les gardes et les consultations, je n'ai pas le temps de gérer mes finances en détail. BudGest fait ça pour moi avec les transactions récurrentes." },
  { name: "Nicolas Bernard", role: "Entrepreneur", avatar: "NB", content: "La séparation entre revenus professionnels et dépenses personnelles est exactement ce dont j'avais besoin. Tableau de bord clair, données fiables." },
];

export default function Testimonials() {
  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-lg mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-neutral text-tertiary text-xs font-bold px-4 py-2 rounded-full mb-5">
            Témoignages
          </div>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold text-ink leading-tight">
            Ils gèrent leur budget <span className="text-info">sereinement</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div key={t.name} className="hover-lift bg-neutral rounded-3xl p-7">
              <p className="text-sm text-tertiary leading-relaxed mb-6">&quot;{t.content}&quot;</p>
              <div className="flex items-center gap-3 pt-5 border-t border-border">
                <div className={`w-10 h-10 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-bold text-ink">{t.name}</div>
                  <div className="text-xs text-tertiary">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
