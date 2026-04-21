import Link from "next/link";

export default function Hero() {
  return (
    <section style={{
      background: "linear-gradient(135deg, #0B1F3A 0%, #0f2d52 50%, #0B1F3A 100%)",
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "120px 24px 80px", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: "20%", right: "10%", width: "400px", height: "400px",
        background: "rgba(59, 130, 246, 0.08)", borderRadius: "50%", filter: "blur(60px)",
      }} />
      <div style={{
        position: "absolute", bottom: "10%", left: "5%", width: "300px", height: "300px",
        background: "rgba(59, 130, 246, 0.05)", borderRadius: "50%", filter: "blur(40px)",
      }} />

      <div style={{
        maxWidth: "1200px", width: "100%", margin: "0 auto",
        display: "grid", gridTemplateColumns: "1fr", gap: "48px",
        alignItems: "center", position: "relative", zIndex: 1,
      }}
        className="lg:grid-cols-hero">

        {/* Texte */}
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.3)",
            borderRadius: "20px", padding: "6px 14px", marginBottom: "24px",
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3B82F6" }} />
            <span style={{ fontSize: "13px", color: "#3B82F6", fontWeight: 500 }}>L'Observatoire de l'Équilibre</span>
          </div>

          <h1 style={{
            fontFamily: "var(--font-manrope)", fontWeight: 800, color: "#fff", lineHeight: 1.15,
            marginBottom: "20px", fontSize: "clamp(32px, 5vw, 52px)",
          }}>
            Maîtrisez votre{" "}
            <span style={{ color: "#3B82F6" }}>budget</span>{" "}
            avec précision
          </h1>

          <p style={{
            fontSize: "clamp(15px, 2vw, 18px)", color: "#94A3B8", lineHeight: 1.7,
            marginBottom: "40px", maxWidth: "480px",
          }}>
            BudGest vous donne une vision claire de vos finances personnelles.
            Suivez vos dépenses, fixez des objectifs et atteignez l'équilibre financier.
          </p>

          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <Link href="/register" style={{
              background: "#3B82F6", color: "#fff", textDecoration: "none",
              padding: "14px 28px", borderRadius: "10px", fontSize: "15px", fontWeight: 600,
              display: "inline-flex", alignItems: "center", gap: "8px",
            }}>Commencer gratuitement →</Link>
            <Link href="/login" style={{
              background: "rgba(255,255,255,0.06)", color: "#fff", textDecoration: "none",
              padding: "14px 28px", borderRadius: "10px", fontSize: "15px", fontWeight: 500,
              border: "1px solid rgba(255,255,255,0.12)",
            }}>Se connecter</Link>
          </div>

          <div style={{
            display: "flex", gap: "32px", marginTop: "56px", paddingTop: "40px",
            borderTop: "1px solid rgba(255,255,255,0.08)", flexWrap: "wrap",
          }}>
            {[
              { value: "10k+", label: "Utilisateurs actifs" },
              { value: "98%", label: "Satisfaction" },
              { value: "0€", label: "Pour commencer" },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{ fontFamily: "var(--font-manrope)", fontSize: "28px", fontWeight: 800, color: "#fff" }}>{stat.value}</div>
                <div style={{ fontSize: "13px", color: "#64748B", marginTop: "2px" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard preview — caché sur mobile */}
        <div className="hidden lg:block" style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px", padding: "24px", backdropFilter: "blur(10px)",
        }}>
          <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            {["#EF4444", "#F59E0B", "#10B981"].map(c => (
              <div key={c} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c }} />
            ))}
            <span style={{ fontSize: "12px", color: "#64748B", marginLeft: "8px" }}>Tableau de bord</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "16px" }}>
            {[
              { label: "Solde total", value: "12 450€", color: "#fff" },
              { label: "Revenus", value: "4 820€", color: "#10B981" },
              { label: "Dépenses", value: "2 140€", color: "#EF4444" },
            ].map((kpi) => (
              <div key={kpi.label} style={{
                background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "12px",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ fontSize: "10px", color: "#64748B", marginBottom: "6px" }}>{kpi.label}</div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
              </div>
            ))}
          </div>

          <div style={{
            background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "16px",
            border: "1px solid rgba(255,255,255,0.06)", marginBottom: "16px",
          }}>
            <div style={{ fontSize: "11px", color: "#64748B", marginBottom: "12px" }}>Évolution mensuelle</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "80px" }}>
              {[40, 65, 45, 80, 60, 90, 70].map((h, i) => (
                <div key={i} style={{ flex: 1, height: "100%", display: "flex", alignItems: "flex-end" }}>
                  <div style={{
                    width: "100%", height: `${h}%`,
                    background: i === 5 ? "#3B82F6" : "rgba(59,130,246,0.3)",
                    borderRadius: "4px 4px 0 0",
                  }} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { name: "Supermarché", cat: "Alimentation", amount: "-88€", color: "#EF4444" },
              { name: "Virement Salaire", cat: "Revenus", amount: "+3 280€", color: "#10B981" },
              { name: "Netflix", cat: "Abonnements", amount: "-17€", color: "#EF4444" },
            ].map((t) => (
              <div key={t.name} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 10px", background: "rgba(255,255,255,0.03)",
                borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)",
              }}>
                <div>
                  <div style={{ fontSize: "12px", color: "#fff", fontWeight: 500 }}>{t.name}</div>
                  <div style={{ fontSize: "10px", color: "#64748B" }}>{t.cat}</div>
                </div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: t.color }}>{t.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}