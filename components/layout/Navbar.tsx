"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const navLinks = ["Fonctionnalités", "Tarifs", "FAQ"];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(11, 31, 58, 0.95)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(59, 130, 246, 0.15)",
    }}>
      <div style={{
        maxWidth: "1200px", margin: "0 auto", padding: "0 24px",
        height: "68px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px", height: "36px", background: "#3B82F6", borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-manrope)", fontWeight: 700, fontSize: "16px", color: "#fff",
            flexShrink: 0,
          }}>B</div>
          <span style={{
            fontFamily: "var(--font-manrope)", fontWeight: 700, fontSize: "20px", color: "#fff",
          }}>BudGest</span>
        </Link>

        {/* Desktop links */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            {navLinks.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                style={{
                  color: "#94A3B8", textDecoration: "none",
                  fontSize: "14px", fontWeight: 500, transition: "color 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "#94A3B8")}
              >{item}</a>
            ))}
          </div>
        )}

        {/* Desktop CTA */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link
              href="/login"
              style={{
                color: "#94A3B8", textDecoration: "none",
                fontSize: "14px", fontWeight: 500, padding: "8px 16px", transition: "color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "#94A3B8")}
            >Se connecter</Link>
            <Link href="/register" style={{
              background: "#3B82F6", color: "#fff", textDecoration: "none",
              fontSize: "14px", fontWeight: 600, padding: "9px 20px", borderRadius: "8px",
              transition: "background 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "#2563EB")}
              onMouseLeave={e => (e.currentTarget.style.background = "#3B82F6")}
            >Commencer gratuitement</Link>
          </div>
        )}

        {/* Burger — mobile only */}
        {isMobile && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#fff", padding: "4px", display: "flex", alignItems: "center",
            }}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
      </div>

      {/* Mobile menu */}
      {isMobile && (
        <div style={{
          background: "#0B1F3A",
          borderTop: "1px solid rgba(59,130,246,0.15)",
          padding: "16px 24px 28px",
          maxHeight: menuOpen ? "500px" : "0",
          overflow: "hidden",
          transition: "max-height 0.3s ease, padding 0.3s ease",
          paddingTop: menuOpen ? "16px" : "0",
          paddingBottom: menuOpen ? "28px" : "0",
        }}>
          {/* Nav links */}
          <div style={{ display: "flex", flexDirection: "column", marginBottom: "20px" }}>
            {navLinks.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                style={{
                  color: "#94A3B8", textDecoration: "none",
                  fontSize: "15px", fontWeight: 500,
                  padding: "14px 8px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  display: "block",
                  transition: "color 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "#94A3B8")}
              >
                {item}
              </a>
            ))}
          </div>

          {/* CTA buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              style={{
                color: "#fff", textDecoration: "none", fontSize: "15px", fontWeight: 500,
                padding: "13px 16px", borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.15)",
                textAlign: "center", display: "block",
                transition: "border-color 0.2s",
              }}
            >Se connecter</Link>
            <Link
              href="/register"
              onClick={() => setMenuOpen(false)}
              style={{
                background: "#3B82F6", color: "#fff", textDecoration: "none",
                fontSize: "15px", fontWeight: 600, padding: "13px 16px",
                borderRadius: "10px", textAlign: "center", display: "block",
              }}
            >Commencer gratuitement</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
