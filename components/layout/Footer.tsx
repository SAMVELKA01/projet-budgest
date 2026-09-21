"use client";

import Link from "next/link";

function Seal() {
  return (
    <svg width="30" height="30" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="17" cy="17" r="16" stroke="#B7935B" strokeWidth="1" />
      <circle cx="17" cy="17" r="12.5" stroke="#B7935B" strokeWidth="1" opacity="0.5" />
      <text x="17" y="21.5" textAnchor="middle" fontFamily="var(--font-serif-display), serif" fontSize="14" fill="#B7935B">B</text>
    </svg>
  );
}

const columns = [
  { title: "Méthode", links: [{ label: "La méthode", href: "#methode" }, { label: "Tarifs", href: "#tarifs" }, { label: "FAQ", href: "#faq" }] },
  { title: "Compte", links: [{ label: "Se connecter", href: "/login" }, { label: "Ouvrir un compte", href: "/register" }, { label: "Tableau de bord", href: "/dashboard" }] },
  { title: "Légal", links: [{ label: "Mentions légales", href: "/mentions-legales" }, { label: "Confidentialité", href: "/confidentialite" }, { label: "Contact", href: "/contact" }] },
];

export default function Footer() {
  return (
    <footer className="landing" style={{ background: "var(--land-ink)", padding: "64px 24px 32px" }}>
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "40px", marginBottom: "48px", paddingBottom: "48px",
          borderBottom: "1px solid var(--land-line-on-dark)",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <Seal />
              <span className="font-display" style={{ fontWeight: 500, fontSize: "18px", color: "#FBFAF6" }}>BudGest</span>
            </div>
            <p style={{ fontSize: "13.5px", color: "#9CA79C", lineHeight: 1.7, maxWidth: "260px" }}>
              La rigueur d&apos;une banque privée, appliquée à votre budget personnel.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-mono" style={{
                fontSize: "11px", fontWeight: 500, color: "#D8B888", marginBottom: "16px",
                textTransform: "uppercase", letterSpacing: "0.1em",
              }}>{col.title}</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
                {col.links.map((link) =>
                  link.href.startsWith("#") ? (
                    <a key={link.label} href={link.href} style={{ fontSize: "13.5px", color: "#9CA79C", textDecoration: "none" }}>{link.label}</a>
                  ) : (
                    <Link key={link.label} href={link.href} style={{ fontSize: "13.5px", color: "#9CA79C", textDecoration: "none" }}>{link.label}</Link>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px",
        }}>
          <span className="font-mono" style={{ fontSize: "12px", color: "#6B7268" }}>BudGest — Registre financier personnel</span>
          <span className="font-mono" style={{ fontSize: "12px", color: "#6B7268" }}>© 2026 BudGest — Tous droits réservés</span>
        </div>
      </div>
    </footer>
  );
}
