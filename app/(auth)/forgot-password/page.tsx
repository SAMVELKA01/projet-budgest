"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { apiPost } from "@/lib/hooks/useApi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email) {
      setError("Veuillez entrer votre email");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await apiPost("/api/auth/forgot-password", { email });
      setSent(true);
    } catch {
      // On affiche toujours le même message de succès générique côté API
      // (anti-énumération) ; une erreur ici ne peut venir que du réseau.
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-app">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-inverse/15 rounded-2xl flex items-center justify-center text-inverse font-bold">B</div>
          <span className="font-bold text-xl text-inverse">BudGest</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl font-semibold text-inverse leading-tight tracking-tight">
            Mot de passe <br /> oublié ?
          </h1>
          <p className="text-inverse/70 max-w-sm text-base leading-relaxed">
            Pas de panique. Indiquez votre email et nous vous envoyons un lien pour en choisir un nouveau.
          </p>
        </div>
        <div className="text-xs font-semibold text-inverse/50 tracking-wide">
          © 2026 BudGest
        </div>
      </div>

      <div className="flex flex-col justify-center items-center p-8 lg:p-24 bg-white">
        <div className="w-full max-w-sm">
          <Link href="/login" className="inline-flex items-center gap-1 text-xs font-semibold text-tertiary hover:text-primary mb-8 no-underline">
            <ArrowLeft size={14} /> Retour à la connexion
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-primary mb-2">
              Réinitialiser le mot de passe
            </h2>
            <p className="text-tertiary text-sm">Nous vous enverrons un lien de réinitialisation.</p>
          </div>

          {sent ? (
            <div className="bg-success/10 border border-success/20 rounded-xl px-4 py-4">
              <p className="text-sm text-success font-medium">
                Si un compte existe avec cet email, un lien de réinitialisation vient d&apos;être envoyé.
                Vérifiez votre boîte de réception (et vos spams).
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-danger/10 border border-danger/20 rounded-xl px-4 py-3 mb-6">
                  <p className="text-sm text-danger font-medium">{error}</p>
                </div>
              )}
              <div className="flex flex-col gap-5">
                <div>
                  <label className="text-[11px] font-semibold text-tertiary uppercase tracking-widest mb-2 block">Email</label>
                  <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-neutral focus-within:ring-2 focus:ring-primary transition-all">
                    <Mail size={16} className="text-tertiary" />
                    <input
                      type="email"
                      placeholder="nom@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      className="flex-1 bg-transparent outline-none text-sm text-primary placeholder:text-tertiary"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-primary text-inverse py-3.5 rounded-full font-semibold text-sm hover:bg-primary-light transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
                >
                  {loading ? "Envoi..." : <>Envoyer le lien <ArrowRight size={16} /></>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
