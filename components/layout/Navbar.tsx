"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Wallet } from "lucide-react";

const navLinks = [
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "Tarifs", href: "#tarifs" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-100 bg-white/90 backdrop-blur-md transition-shadow ${scrolled ? "shadow-sm" : ""}`}
    >
      <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center shrink-0">
            <Wallet size={18} className="text-inverse" />
          </div>
          <span className="font-bold text-lg text-ink">BudGest</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <a key={item.label} href={item.href} className="text-sm font-medium text-tertiary hover:text-ink transition-colors no-underline">
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-ink px-4 py-2.5 hover:opacity-70 transition-opacity no-underline">
            Se connecter
          </Link>
          <Link href="/register" className="bg-primary text-inverse text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-primary-light transition-colors no-underline">
            Ouvrir un compte
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
          className="md:hidden text-ink p-1"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-border px-6 pt-4 pb-6 flex flex-col gap-1">
          {navLinks.map((item) => (
            <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-ink py-3 border-b border-border no-underline">
              {item.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 mt-4">
            <Link href="/login" onClick={() => setMenuOpen(false)}
              className="text-center text-sm font-semibold text-ink py-3 rounded-full border border-border no-underline">
              Se connecter
            </Link>
            <Link href="/register" onClick={() => setMenuOpen(false)}
              className="text-center bg-primary text-inverse text-sm font-semibold py-3 rounded-full no-underline">
              Ouvrir un compte
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
