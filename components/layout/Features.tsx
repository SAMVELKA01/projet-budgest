"use client";

export default function Features() {
  const features = [
    {
      icon: "💰",
      title: "Suivi des transactions",
      description: "Enregistrez revenus et dépenses en quelques secondes. Catégorisez automatiquement et gardez une vue claire de vos flux financiers.",
      color: "#3B82F6",
    },
    {
      icon: "📊",
      title: "Analytique avancée",
      description: "Visualisez vos habitudes avec des graphiques clairs. Comprenez où va votre argent mois après mois.",
      color: "#10B981",
    },
    {
      icon: "🎯",
      title: "Budgets par catégorie",
      description: "Fixez des plafonds de dépenses par catégorie et recevez des alertes avant de les dépasser.",
      color: "#F59E0B",
    },
    {
      icon: "🏆",
      title: "Objectifs d'épargne",
      description: "Créez des objectifs financiers et suivez votre progression. Vacances, achat, retraite — tout est possible.",
      color: "#8B5CF6",
    },
    {
      icon: "🔄",
      title: "Transactions récurrentes",
      description: "Loyer, abonnements, salaire — configurez une fois, BudGest s'occupe du reste automatiquement.",
      color: "#EC4899",
    },
    {
      icon: "🔒",
      title: "Sécurité maximale",
      description: "Vos données sont chiffrées de bout en bout. Votre vie financière reste strictement privée.",
      color: "#64748B",
    },
  ];

  return (
    <section id="fonctionnalités" style={{
      background: "#F9FAFB",
      padding: "100px 24px",
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

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
            <span style={{ fontSize: "13px", color: "#3B82F6", fontWeight: 500 }}>
              Fonctionnalités
            </span>
          </div>
          <h2 style={{
            fontFamily: "var(--font-manrope)",
            fontSize: "40px",
            fontWeight: 800,
            color: "#0B1F3A",
            marginBottom: "16px",
          }}>
            Tout ce qu'il vous faut pour{" "}
            <span style={{ color: "#3B82F6" }}>maîtriser vos finances</span>
          </h2>
          <p style={{
            fontSize: "17px",
            color: "#64748B",
            maxWidth: "560px",
            margin: "0 auto",
            lineHeight: 1.7,
          }}>
            BudGest réunit tous les outils essentiels dans une interface claire et intuitive.
          </p>
        </div>

        {/* Grid features */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
        }}>
          {features.map((feature) => (
            <div key={feature.title} style={{
              background: "#fff",
              border: "1px solid #E2E8F0",
              borderRadius: "16px",
              padding: "32px",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "default",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(11,31,58,0.08)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              <div style={{
                width: "48px",
                height: "48px",
                background: `${feature.color}15`,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                marginBottom: "20px",
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontFamily: "var(--font-manrope)",
                fontSize: "17px",
                fontWeight: 700,
                color: "#0B1F3A",
                marginBottom: "10px",
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: "14px",
                color: "#64748B",
                lineHeight: 1.7,
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}