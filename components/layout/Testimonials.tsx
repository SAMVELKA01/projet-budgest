"use client";

export default function Testimonials() {
  const testimonials = [
    { name: "Sophie Martin", role: "Freelance designer", avatar: "SM", content: "BudGest a complètement changé ma façon de gérer mes finances. En tant que freelance, je jonglais entre plusieurs sources de revenus — maintenant tout est clair en un coup d'œil.", color: "#3B82F6" },
    { name: "Karim Benali", role: "Ingénieur logiciel", avatar: "KB", content: "L'interface est incroyablement propre. Les graphiques mensuels m'ont aidé à identifier que je dépensais 40% de mon budget en restaurants sans m'en rendre compte.", color: "#10B981" },
    { name: "Léa Rousseau", role: "Étudiante en master", avatar: "LR", content: "Avec un budget serré d'étudiante, BudGest m'aide à tenir mes objectifs d'épargne chaque mois. Simple, efficace, gratuit pour commencer.", color: "#8B5CF6" },
    { name: "Thomas Dupont", role: "Chef de projet", avatar: "TD", content: "J'ai testé beaucoup d'apps de budget. BudGest est la seule que j'utilise encore après 6 mois. Les alertes de dépassement sont une vraie révélation.", color: "#F59E0B" },
    { name: "Amina Diallo", role: "Médecin", avatar: "AD", content: "Entre les gardes et les consultations, je n'ai pas le temps de gérer mes finances en détail. BudGest fait ça pour moi avec les transactions récurrentes.", color: "#EC4899" },
    { name: "Nicolas Bernard", role: "Entrepreneur", avatar: "NB", content: "La séparation entre revenus professionnels et dépenses personnelles est exactement ce dont j'avais besoin. Tableau de bord clair, données fiables.", color: "#64748B" },
  ];

  return (
    <section style={{ background: "#F9FAFB", padding: "80px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: "20px", padding: "6px 14px", marginBottom: "20px",
          }}>
            <span style={{ fontSize: "13px", color: "#3B82F6", fontWeight: 500 }}>Témoignages</span>
          </div>
          <h2 style={{
            fontFamily: "var(--font-manrope)", fontWeight: 800, color: "#0B1F3A", marginBottom: "16px",
            fontSize: "clamp(28px, 4vw, 40px)",
          }}>
            Ils ont retrouvé l'<span style={{ color: "#3B82F6" }}>équilibre financier</span>
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
        }}>
          {testimonials.map((t) => (
            <div key={t.name} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "28px" }}>
              <div style={{ display: "flex", gap: "4px", marginBottom: "16px" }}>
                {[...Array(5)].map((_, i) => <span key={i} style={{ color: "#F59E0B", fontSize: "14px" }}>★</span>)}
              </div>
              <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.75, marginBottom: "24px" }}>"{t.content}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%", background: `${t.color}20`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", fontWeight: 700, color: t.color, flexShrink: 0,
                }}>{t.avatar}</div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#0B1F3A" }}>{t.name}</div>
                  <div style={{ fontSize: "12px", color: "#94A3B8" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}