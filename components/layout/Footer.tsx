"use client";

import Link from "next/link";
import { Wallet } from "lucide-react";

const columns = [
  { title: "Produit", links: [{ label: "Fonctionnalités", href: "#fonctionnalites" }, { label: "Tarifs", href: "#tarifs" }, { label: "FAQ", href: "#faq" }] },
  { title: "Compte", links: [{ label: "Se connecter", href: "/login" }, { label: "Ouvrir un compte", href: "/register" }, { label: "Tableau de bord", href: "/dashboard" }] },
  { title: "Légal", links: [{ label: "Mentions légales", href: "/mentions-legales" }, { label: "Confidentialité", href: "/confidentialite" }, { label: "Contact", href: "/contact" }] },
];

export default function Footer() {
  return (
    <footer className="bg-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12 pb-12 border-b border-border">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
                <Wallet size={16} className="text-inverse" />
              </div>
              <span className="font-bold text-lg text-ink">BudGest</span>
            </div>
            <p className="text-sm text-tertiary leading-relaxed max-w-60">
              Votre budget personnel, géré avec clarté et simplicité.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold text-tertiary uppercase tracking-wider mb-4">{col.title}</h4>
              <div className="flex flex-col gap-3">
                {col.links.map((link) =>
                  link.href.startsWith("#") ? (
                    <a key={link.label} href={link.href} className="text-sm text-tertiary hover:text-ink transition-colors no-underline">{link.label}</a>
                  ) : (
                    <Link key={link.label} href={link.href} className="text-sm text-tertiary hover:text-ink transition-colors no-underline">{link.label}</Link>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center flex-wrap gap-3">
          <span className="text-xs text-tertiary">BudGest — Gestion de budget personnel</span>
          <span className="text-xs text-tertiary">© 2026 BudGest — Tous droits réservés</span>
        </div>
      </div>
    </footer>
  );
}
