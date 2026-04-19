"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: "rgba(11, 31, 58, 0.95)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(59, 130, 246, 0.15)",
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 24px",
        height: "68px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
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
        </Link>

        {/* Links desktop */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }} className="nav-links">
          {["Fonctionnalités", "Tarifs", "FAQ"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{
              color: "#94A3B8",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 500,
              transition: "color 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "#94A3B8")}
            >{item}</a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/login" style={{
            color: "#94A3B8",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 500,
            padding: "8px 16px",
            transition: "color 0.2s",
          }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "#94A3B8")}
          >Se connecter</Link>
          <Link href="/register" style={{
            background: "#3B82F6",
            color: "#fff",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 600,
            padding: "9px 20px",
            borderRadius: "8px",
            transition: "background 0.2s",
          }}
            onMouseEnter={e => (e.currentTarget.style.background = "#2563EB")}
            onMouseLeave={e => (e.currentTarget.style.background = "#3B82F6")}
          >Commencer gratuitement</Link>
        </div>
      </div>
    </nav>
  );
}