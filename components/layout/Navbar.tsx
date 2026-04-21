"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(11, 31, 58, 0.95)",
      backdropFilter: "blur(12px)",
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
          }}>B</div>
          <span style={{ fontFamily: "var(--font-manrope)", fontWeight: 700, fontSize: "20px", color: "#fff" }}>BudGest</span>
        </Link>

        {/* Links desktop */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}
          className="hidden md:flex">
          {["Fonctionnalités", "Tarifs", "FAQ"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{
              color: "#94A3B8", textDecoration: "none", fontSize: "14px", fontWeight: 500, transition: "color 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "#94A3B8")}
            >{item}</a>
          ))}
        </div>

        {/* CTA desktop */}
        <div className="hidden md:flex" style={{ alignItems: "center", gap: "12px" }}>
          <Link href="/login" style={{
            color: "#94A3B8", textDecoration: "none", fontSize: "14px", fontWeight: 500, padding: "8px 16px",
          }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "#94A3B8")}
          >Se connecter</Link>
          <Link href="/register" style={{
            background: "#3B82F6", color: "#fff", textDecoration: "none",
            fontSize: "14px", fontWeight: 600, padding: "9px 20px", borderRadius: "8px",
          }}>Commencer gratuitement</Link>
        </div>

        {/* Burger mobile */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", padding: "4px" }}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div style={{
          background: "#0B1F3A", borderTop: "1px solid rgba(59,130,246,0.15)",
          padding: "16px 24px 24px",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "20px" }}>
            {["Fonctionnalités", "Tarifs", "FAQ"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                style={{
                  color: "#94A3B8", textDecoration: "none", fontSize: "15px",
                  fontWeight: 500, padding: "12px 8px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}>
                {item}
              </a>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link href="/login" onClick={() => setMenuOpen(false)} style={{
              color: "#fff", textDecoration: "none", fontSize: "15px", fontWeight: 500,
              padding: "12px 16px", borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.12)", textAlign: "center",
            }}>Se connecter</Link>
            <Link href="/register" onClick={() => setMenuOpen(false)} style={{
              background: "#3B82F6", color: "#fff", textDecoration: "none",
              fontSize: "15px", fontWeight: 600, padding: "12px 16px",
              borderRadius: "10px", textAlign: "center",
            }}>Commencer gratuitement</Link>
          </div>
        </div>
      )}
    </nav>
  );
}