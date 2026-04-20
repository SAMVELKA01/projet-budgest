"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (res?.error) {
        setError("Email ou mot de passe incorrect");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral flex flex-col">

      {/* Header */}
      <div className="flex justify-between items-center px-8 py-5 border-b border-border">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center text-white font-bold text-sm">B</div>
          <span className="font-bold text-lg text-primary" style={{ fontFamily: "var(--font-heading)" }}>BudGest</span>
        </Link>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl" style={{ fontFamily: "var(--font-heading)" }}>B</span>
            </div>
            <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>BudGest</h1>
            <p className="text-tertiary text-sm mt-1">L'Observatoire de l'Équilibre</p>
          </div>

          <div className="bg-white rounded-2xl border border-border p-8">
            <h2 className="text-xl font-bold text-primary mb-1" style={{ fontFamily: "var(--font-heading)" }}>Connexion</h2>
            <p className="text-tertiary text-sm mb-6">Accédez à votre espace financier sécurisé.</p>

            {error && (
              <div className="bg-danger/10 border border-danger/20 rounded-xl px-4 py-3 mb-4">
                <p className="text-sm text-danger font-medium">{error}</p>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Email</label>
                <div className="flex items-center gap-3 border border-border rounded-lg px-4 py-3 bg-neutral focus-within:border-secondary transition-colors">
                  <span className="text-tertiary text-sm">✉</span>
                  <input
                    type="email"
                    placeholder="nom@exemple.com"
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    className="flex-1 bg-transparent outline-none text-sm text-primary placeholder:text-tertiary"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-primary uppercase tracking-wide">Mot de passe</label>
                  <Link href="/forgot-password" className="text-xs text-secondary no-underline hover:underline">Mot de passe oublié ?</Link>
                </div>
                <div className="flex items-center gap-3 border border-border rounded-lg px-4 py-3 bg-neutral focus-within:border-secondary transition-colors">
                  <span className="text-tertiary text-sm">🔒</span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className="flex-1 bg-transparent outline-none text-sm text-primary placeholder:text-tertiary"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold text-sm mt-2 hover:bg-primary-light transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? "Connexion..." : "Se connecter →"}
              </button>
            </div>

            <p className="text-center text-sm text-tertiary mt-6">
              Nouveau sur BudGest ?{" "}
              <Link href="/register" className="text-secondary font-semibold no-underline hover:underline">Créer un compte</Link>
            </p>
          </div>

          <p className="text-center text-xs text-tertiary mt-6 flex items-center justify-center gap-2">
            <span>🔒</span> CRYPTAGE DE BOUT EN BOUT
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center px-8 py-5 border-t border-border">
        <span className="text-xs text-tertiary font-semibold">BudGest</span>
        <span className="text-xs text-tertiary">L'OBSERVATOIRE DE L'ÉQUILIBRE</span>
        <div className="flex gap-6">
          {["MENTIONS LÉGALES", "CONFIDENTIALITÉ", "CONTACT"].map((item) => (
            <a key={item} href="#" className="text-xs text-tertiary no-underline hover:text-primary transition-colors">{item}</a>
          ))}
        </div>
        <span className="text-xs text-tertiary">© 2024 BUDGEST</span>
      </div>

    </div>
  );
}