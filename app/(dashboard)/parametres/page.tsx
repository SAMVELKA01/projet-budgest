"use client";

import { useState } from "react";

export default function ParametresPage() {
  const [nom, setNom] = useState("Jean Dupont");
  const [email, setEmail] = useState("jean.dupont@exemple.com");
  const [devise, setDevise] = useState("EUR");
  const [notifications, setNotifications] = useState({
    depassement: true,
    recap: true,
    objectifs: false,
  });

  return (
    <div className="flex flex-col gap-6 max-w-3xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
          Paramètres
        </h1>
        <p className="text-tertiary text-sm mt-1">Gérez votre profil et vos préférences.</p>
      </div>

      {/* Profil */}
      <div className="bg-white border border-border rounded-2xl p-6">
        <h2 className="text-base font-bold text-primary mb-5" style={{ fontFamily: "var(--font-heading)" }}>
          Informations personnelles
        </h2>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-white text-xl font-bold shrink-0">
            {nom.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">{nom}</p>
            <p className="text-xs text-tertiary">{email}</p>
            <button className="text-xs text-secondary font-semibold mt-1 hover:underline">
              Changer la photo
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Nom complet</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm text-primary outline-none focus:border-secondary transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm text-primary outline-none focus:border-secondary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Devise</label>
            <select
              value={devise}
              onChange={(e) => setDevise(e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm text-primary outline-none focus:border-secondary transition-colors bg-white"
            >
              <option value="EUR">Euro (€)</option>
              <option value="USD">Dollar ($)</option>
              <option value="GBP">Livre sterling (£)</option>
              <option value="XOF">Franc CFA (FCFA)</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors">
              Sauvegarder
            </button>
          </div>
        </div>
      </div>

      {/* Mot de passe */}
      <div className="bg-white border border-border rounded-2xl p-6">
        <h2 className="text-base font-bold text-primary mb-5" style={{ fontFamily: "var(--font-heading)" }}>
          Sécurité
        </h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Mot de passe actuel</label>
            <input type="password" placeholder="••••••••" className="w-full border border-border rounded-lg px-4 py-3 text-sm text-primary outline-none focus:border-secondary transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Nouveau mot de passe</label>
              <input type="password" placeholder="••••••••" className="w-full border border-border rounded-lg px-4 py-3 text-sm text-primary outline-none focus:border-secondary transition-colors" />
            </div>
            <div>
              <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Confirmer</label>
              <input type="password" placeholder="••••••••" className="w-full border border-border rounded-lg px-4 py-3 text-sm text-primary outline-none focus:border-secondary transition-colors" />
            </div>
          </div>
          <div className="flex justify-end">
            <button className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors">
              Changer le mot de passe
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white border border-border rounded-2xl p-6">
        <h2 className="text-base font-bold text-primary mb-5" style={{ fontFamily: "var(--font-heading)" }}>
          Notifications
        </h2>

        <div className="flex flex-col gap-4">
          {[
            { key: "depassement", label: "Alertes de dépassement de budget", desc: "Recevez une alerte quand vous dépassez un budget." },
            { key: "recap", label: "Récapitulatif mensuel", desc: "Un résumé de vos finances chaque fin de mois." },
            { key: "objectifs", label: "Progression des objectifs", desc: "Notifications sur l'avancement de vos objectifs d'épargne." },
          ].map((notif) => (
            <div key={notif.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-semibold text-primary">{notif.label}</p>
                <p className="text-xs text-tertiary mt-0.5">{notif.desc}</p>
              </div>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [notif.key]: !prev[notif.key as keyof typeof prev] }))}
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                  notifications[notif.key as keyof typeof notifications] ? "bg-secondary" : "bg-border"
                }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  notifications[notif.key as keyof typeof notifications] ? "translate-x-5" : "translate-x-0.5"
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white border border-danger/30 rounded-2xl p-6">
        <h2 className="text-base font-bold text-danger mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Zone dangereuse
        </h2>
        <p className="text-sm text-tertiary mb-4">Ces actions sont irréversibles. Soyez certain avant de continuer.</p>
        <div className="flex gap-3">
          <button className="border border-danger/30 text-danger px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-danger/05 transition-colors">
            Exporter mes données
          </button>
          <button className="bg-danger text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
            Supprimer mon compte
          </button>
        </div>
      </div>

    </div>
  );
}