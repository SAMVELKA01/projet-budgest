"use client";

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
    <section className="landing" style={{ background: "var(--land-parchment)", padding: "104px 24px" }}>
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <div className="landing-eyebrow" style={{ color: "var(--land-forest)", marginBottom: "20px", justifyContent: "center" }}>
            Témoignages
          </div>
          <h2 className="font-display" style={{
            fontWeight: 500, color: "var(--land-ink)", marginBottom: "16px",
            fontSize: "clamp(28px, 3.6vw, 38px)",
          }}>
            Consigné par ceux qui <em style={{ fontStyle: "italic", color: "var(--land-forest)" }}>tiennent leurs comptes</em>
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1px", background: "var(--land-line)", border: "1px solid var(--land-line)",
        }}>
          {testimonials.map((t) => (
            <div key={t.name} style={{ background: "var(--land-paper)", padding: "30px" }}>
              <div className="font-display" style={{ fontSize: "30px", color: "var(--land-brass)", lineHeight: 0.5, marginBottom: "18px" }}>
                &quot;
              </div>
              <p style={{ fontSize: "13.5px", color: "var(--land-muted)", lineHeight: 1.75, marginBottom: "24px" }}>{t.content}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "16px", borderTop: "1px solid var(--land-line)" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%", border: "1px solid var(--land-brass)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: 600, color: "var(--land-forest)", flexShrink: 0,
                }}>{t.avatar}</div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--land-ink)" }}>{t.name}</div>
                  <div style={{ fontSize: "11.5px", color: "var(--land-muted)" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
