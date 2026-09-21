"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Méthode", href: "#methode" },
  { label: "Tarifs", href: "#tarifs" },
  { label: "FAQ", href: "#faq" },
];

function Seal() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="17" cy="17" r="16" stroke="#B7935B" strokeWidth="1" />
      <circle cx="17" cy="17" r="12.5" stroke="#B7935B" strokeWidth="1" opacity="0.5" />
      <text x="17" y="21.5" textAnchor="middle" fontFamily="var(--font-serif-display), serif" fontSize="14" fill="#B7935B">B</text>
    </svg>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 900);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <nav className="landing" style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(14, 25, 19, 0.92)" : "rgba(14, 25, 19, 0.7)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      borderBottom: `1px solid ${scrolled ? "var(--land-line-on-dark)" : "transparent"}`,
      transition: "background 0.3s ease, border-color 0.3s ease",
    }}>
      <div style={{
        maxWidth: "1180px", margin: "0 auto", padding: "0 24px",
        height: "72px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
          <Seal />
          <span className="font-display" style={{ fontWeight: 500, fontSize: "20px", color: "#FBFAF6", letterSpacing: "0.01em" }}>
            BudGest
          </span>
        </Link>

        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "36px" }}>
            {navLinks.map((item) => (
              <a key={item.label} href={item.href} style={{
                color: "#9CA79C", textDecoration: "none", fontSize: "13px",
                fontWeight: 500, letterSpacing: "0.03em", transition: "color 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.color = "#D8B888")}
                onMouseLeave={e => (e.currentTarget.style.color = "#9CA79C")}
              >{item.label}</a>
            ))}
          </div>
        )}

        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Link href="/login" style={{
              color: "#9CA79C", textDecoration: "none", fontSize: "13px",
              fontWeight: 500, padding: "9px 16px", transition: "color 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.color = "#FBFAF6")}
              onMouseLeave={e => (e.currentTarget.style.color = "#9CA79C")}
            >Se connecter</Link>
            <Link href="/register" style={{
              background: "#B7935B", color: "#0E1913", textDecoration: "none",
              fontSize: "13px", fontWeight: 600, padding: "10px 20px", borderRadius: "3px",
              letterSpacing: "0.01em", transition: "background 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "#D8B888")}
              onMouseLeave={e => (e.currentTarget.style.background = "#B7935B")}
            >Ouvrir un compte</Link>
          </div>
        )}

        {isMobile && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#FBFAF6", padding: "4px", display: "flex" }}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        )}
      </div>

      {isMobile && (
        <div style={{
          background: "#0E1913",
          borderTop: menuOpen ? "1px solid var(--land-line-on-dark)" : "1px solid transparent",
          padding: "0 24px",
          maxHeight: menuOpen ? "420px" : "0",
          overflow: "hidden",
          transition: "max-height 0.3s ease, padding 0.3s ease",
          paddingTop: menuOpen ? "16px" : "0",
          paddingBottom: menuOpen ? "24px" : "0",
        }}>
          <div style={{ display: "flex", flexDirection: "column", marginBottom: "16px" }}>
            {navLinks.map((item) => (
              <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)} style={{
                color: "#9CA79C", textDecoration: "none", fontSize: "15px", fontWeight: 500,
                padding: "13px 4px", borderBottom: "1px solid var(--land-line-on-dark)", display: "block",
              }}>{item.label}</a>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link href="/login" onClick={() => setMenuOpen(false)} style={{
              color: "#FBFAF6", textDecoration: "none", fontSize: "14px", fontWeight: 500,
              padding: "12px 16px", borderRadius: "3px", border: "1px solid var(--land-line-on-dark)",
              textAlign: "center", display: "block",
            }}>Se connecter</Link>
            <Link href="/register" onClick={() => setMenuOpen(false)} style={{
              background: "#B7935B", color: "#0E1913", textDecoration: "none", fontSize: "14px",
              fontWeight: 600, padding: "12px 16px", borderRadius: "3px", textAlign: "center", display: "block",
            }}>Ouvrir un compte</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
