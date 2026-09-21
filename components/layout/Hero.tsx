"use client";

import Link from "next/link";

const stats = [
  { value: "10 000+", label: "Comptes ouverts" },
  { value: "100%", label: "Données privées" },
  { value: "0€", label: "Pour commencer" },
];

const postes = [
  { name: "Supermarché", cat: "Alimentation", amount: "88,40", sign: "-" },
  { name: "Virement salaire", cat: "Revenus", amount: "3 280,00", sign: "+" },
  { name: "Netflix", cat: "Abonnements", amount: "17,00", sign: "-" },
];

function Sparkline() {
  const points = "0,38 20,30 40,34 60,18 80,24 100,6 120,14";
  return (
    <svg viewBox="0 0 120 44" width="100%" height="52" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke="#B7935B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="120" cy="14" r="2.4" fill="#B7935B" />
    </svg>
  );
}

export default function Hero() {
  return (
    <section className="landing" style={{
      background: "radial-gradient(ellipse 80% 60% at 30% 0%, #16261C 0%, #0E1913 55%, #0A130E 100%)",
      minHeight: "100vh", display: "flex", alignItems: "center",
      padding: "128px 24px 80px", position: "relative", overflow: "hidden",
    }}>
      {/* Texture : hairlines verticales très subtiles, évoquent un grand-livre */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, opacity: 0.35,
        backgroundImage: "repeating-linear-gradient(90deg, rgba(183,147,91,0.04) 0px, rgba(183,147,91,0.04) 1px, transparent 1px, transparent 120px)",
        pointerEvents: "none",
      }} />
      <div aria-hidden style={{
        position: "absolute", top: "-10%", right: "-5%", width: "520px", height: "520px",
        background: "radial-gradient(circle, rgba(183,147,91,0.10) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div className="landing-hero-grid" style={{
        maxWidth: "1180px", width: "100%", margin: "0 auto",
        display: "grid", gap: "56px",
        alignItems: "center", position: "relative", zIndex: 1,
      }}>

        <div className="landing-reveal">
          <div className="landing-eyebrow" style={{ color: "#D8B888", marginBottom: "28px" }}>
            Gestion financière personnelle
          </div>

          <h1 className="font-display" style={{
            fontWeight: 500, color: "#FBFAF6", lineHeight: 1.12,
            marginBottom: "24px", fontSize: "clamp(34px, 5vw, 54px)", letterSpacing: "-0.01em",
          }}>
            Vos finances, tenues avec la rigueur{" "}
            <em style={{ color: "#D8B888", fontStyle: "italic" }}>d&apos;une banque privée</em>
          </h1>

          <p style={{
            fontSize: "clamp(15px, 1.6vw, 17px)", color: "#9CA79C", lineHeight: 1.75,
            marginBottom: "40px", maxWidth: "460px",
          }}>
            BudGest consigne chaque entrée, chaque catégorie, chaque objectif
            avec la précision d&apos;un registre patrimonial — sans jamais accéder
            à vos comptes bancaires.
          </p>

          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "56px" }}>
            <Link href="/register" style={{
              background: "#B7935B", color: "#0E1913", textDecoration: "none",
              padding: "15px 28px", borderRadius: "3px", fontSize: "14px", fontWeight: 600,
              display: "inline-flex", alignItems: "center", gap: "8px", letterSpacing: "0.01em",
              transition: "background 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "#D8B888")}
              onMouseLeave={e => (e.currentTarget.style.background = "#B7935B")}
            >Ouvrir un compte gratuit →</Link>
            <Link href="#methode" style={{
              background: "transparent", color: "#FBFAF6", textDecoration: "none",
              padding: "15px 28px", borderRadius: "3px", fontSize: "14px", fontWeight: 500,
              border: "1px solid var(--land-line-on-dark)", letterSpacing: "0.01em",
            }}>Découvrir la méthode</Link>
          </div>

          <div style={{
            display: "flex", gap: "36px", paddingTop: "28px",
            borderTop: "1px solid var(--land-line-on-dark)", flexWrap: "wrap",
          }}>
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="font-mono" style={{ fontSize: "22px", fontWeight: 500, color: "#FBFAF6" }}>{stat.value}</div>
                <div style={{ fontSize: "12px", color: "#6B7268", marginTop: "4px", letterSpacing: "0.02em" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Relevé patrimonial — élément signature, flotte comme un vrai document */}
        <div className="hidden lg:block landing-reveal" style={{ animationDelay: "0.15s" }}>
          <div style={{
            background: "#FBFAF6", borderRadius: "6px", padding: "0",
            boxShadow: "0 32px 64px rgba(0,0,0,0.35), 0 2px 0 var(--land-brass)",
            overflow: "hidden", transform: "rotate(0.6deg)",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "20px 24px", borderBottom: "1px solid var(--land-line)",
            }}>
              <div>
                <div className="font-mono" style={{ fontSize: "10px", color: "#6B7268", letterSpacing: "0.08em", marginBottom: "4px" }}>
                  RELEVÉ PATRIMONIAL — N° 0192 44 7710
                </div>
                <div className="font-display" style={{ fontSize: "15px", fontWeight: 500, color: "#21261F" }}>
                  Octobre 2026
                </div>
              </div>
              <div style={{
                fontSize: "9px", fontWeight: 600, color: "#B7935B", letterSpacing: "0.1em",
                border: "1px solid var(--land-brass)", borderRadius: "20px", padding: "4px 10px",
              }}>CONFIDENTIEL</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "20px 24px 0" }}>
              {[
                { label: "Solde total", value: "12 450,00", color: "#21261F" },
                { label: "Revenus", value: "+4 820,00", color: "#1D4A38" },
                { label: "Dépenses", value: "-2 140,00", color: "#8A3B2E" },
              ].map((kpi, i) => (
                <div key={kpi.label} style={{
                  paddingRight: "12px",
                  borderRight: i < 2 ? "1px solid var(--land-line)" : "none",
                }}>
                  <div style={{ fontSize: "10px", color: "#6B7268", marginBottom: "6px", letterSpacing: "0.02em" }}>{kpi.label}</div>
                  <div className="font-mono" style={{ fontSize: "14px", fontWeight: 500, color: kpi.color }}>{kpi.value}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: "20px 24px 4px" }}>
              <Sparkline />
            </div>

            <div style={{ padding: "4px 24px 24px" }}>
              <div style={{ fontSize: "10px", color: "#6B7268", marginBottom: "12px", letterSpacing: "0.02em" }}>
                Dernières opérations
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {postes.map((p) => (
                  <div key={p.name} style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                    <div style={{ fontSize: "12px", color: "#21261F", fontWeight: 500, whiteSpace: "nowrap" }}>{p.name}</div>
                    <div style={{ flex: 1, borderBottom: "1px dotted var(--land-line)", transform: "translateY(-3px)" }} />
                    <div className="font-mono" style={{
                      fontSize: "12px", fontWeight: 500, whiteSpace: "nowrap",
                      color: p.sign === "+" ? "#1D4A38" : "#21261F",
                    }}>{p.sign}{p.amount} €</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
