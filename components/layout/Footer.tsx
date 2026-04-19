"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{
      background: "#0B1F3A",
      padding: "64px 24px 32px",
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Top */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: "48px",
          marginBottom: "48px",
        }}>

          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{
                width: "36px",
                height: "36px",
                background: "#3B82F6",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-manrope)",
                fontWeight: 700,
                fontSize: "16px",
                color: "#fff",
              }}>B</div>
              <span style={{
                fontFamily: "var(--font-manrope)",
                fontWeight: 700,
                fontSize: "20px",
                color: "#fff",
              }}>BudGest</span>
            </div>
            <p style={{
              fontSize: "14px",
              color: "#64748B",
              lineHeight: 1.7,
              maxWidth: "280px",
              marginBottom: "24px",
            }}>
              L'Observatoire de l'Équilibre. Gérez votre budget personnel avec précision et sérénité.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              {["Twitter", "LinkedIn", "GitHub"].map((social) => (
                <div key={social} style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}>
                  <span style={{ fontSize: "12px", color: "#64748B" }}>
                    {social[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Produit */}
          <div>
            <h4 style={{
              fontFamily: "var(--font-manrope)",
              fontSize: "13px",
              fontWeight: 600,
              color: "#fff",
              marginBottom: "16px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}>
              Produit
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Fonctionnalités", href: "#fonctionnalités" },
                { label: "Tarifs", href: "#tarifs" },
                { label: "FAQ", href: "#faq" },
              ].map((link) => (
                <a key={link.label} href={link.href} style={{
                  fontSize: "14px",
                  color: "#64748B",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#64748B")}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Compte */}
          <div>
            <h4 style={{
              fontFamily: "var(--font-manrope)",
              fontSize: "13px",
              fontWeight: 600,
              color: "#fff",
              marginBottom: "16px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}>
              Compte
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Se connecter", href: "/login" },
                { label: "Créer un compte", href: "/register" },
                { label: "Tableau de bord", href: "/dashboard" },
              ].map((link) => (
                <Link key={link.label} href={link.href} style={{
                  fontSize: "14px",
                  color: "#64748B",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#64748B")}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Légal */}
          <div>
            <h4 style={{
              fontFamily: "var(--font-manrope)",
              fontSize: "13px",
              fontWeight: 600,
              color: "#fff",
              marginBottom: "16px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}>
              Légal
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Mentions légales", href: "/mentions-legales" },
                { label: "Confidentialité", href: "/confidentialite" },
                { label: "Contact", href: "/contact" },
              ].map((link) => (
                <Link key={link.label} href={link.href} style={{
                  fontSize: "14px",
                  color: "#64748B",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#64748B")}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span style={{ fontSize: "13px", color: "#64748B" }}>
            BudGest · L'Observatoire de l'Équilibre
          </span>
          <span style={{ fontSize: "13px", color: "#64748B" }}>
            © 2024 BudGest — Tous droits réservés
          </span>
        </div>
      </div>
    </footer>
  );
}