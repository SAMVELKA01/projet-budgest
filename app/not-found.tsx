import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0B1F3A",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{ textAlign: "center", maxWidth: "480px" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "48px" }}>
          <div style={{
            width: "40px", height: "40px", background: "#3B82F6", borderRadius: "12px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: "18px", color: "#fff",
          }}>B</div>
          <span style={{ fontFamily: "var(--font-manrope)", fontWeight: 700, fontSize: "22px", color: "#fff" }}>BudGest</span>
        </div>

        {/* 404 */}
        <div style={{
          fontSize: "120px", fontWeight: 800, color: "rgba(59,130,246,0.15)",
          lineHeight: 1, marginBottom: "24px", fontFamily: "var(--font-manrope)",
        }}>404</div>

        <h1 style={{
          fontFamily: "var(--font-manrope)", fontSize: "28px", fontWeight: 700,
          color: "#fff", marginBottom: "12px",
        }}>Page introuvable</h1>

        <p style={{ fontSize: "16px", color: "#64748B", lineHeight: 1.7, marginBottom: "40px" }}>
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/dashboard" style={{
            background: "#3B82F6", color: "#fff", textDecoration: "none",
            padding: "12px 24px", borderRadius: "10px", fontSize: "15px", fontWeight: 600,
          }}>
            Tableau de bord →
          </Link>
          <Link href="/" style={{
            background: "rgba(255,255,255,0.06)", color: "#fff", textDecoration: "none",
            padding: "12px 24px", borderRadius: "10px", fontSize: "15px", fontWeight: 500,
            border: "1px solid rgba(255,255,255,0.12)",
          }}>
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}