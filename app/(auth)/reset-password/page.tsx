"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight } from "lucide-react";
import { apiPost } from "@/lib/hooks/useApi";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!password || !confirm) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    if (password.length < 8) {
      setError("Mot de passe trop court (8 caractères minimum)");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await apiPost("/api/auth/reset-password", { token, newPassword: password });
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la réinitialisation");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-danger/10 border border-danger/20 rounded-xl px-4 py-4">
        <p className="text-sm text-danger font-medium">
          Lien invalide. Redemandez un lien de réinitialisation depuis la page{" "}
          <Link href="/forgot-password" className="underline">mot de passe oublié</Link>.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="bg-success/10 border border-success/20 rounded-xl px-4 py-4">
        <p className="text-sm text-success font-medium">
          Mot de passe réinitialisé avec succès ! Redirection vers la connexion...
        </p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="bg-danger/10 border border-danger/20 rounded-xl px-4 py-3 mb-6">
          <p className="text-sm text-danger font-medium">{error}</p>
        </div>
      )}
      <div className="flex flex-col gap-5">
        <div>
          <label className="text-[11px] font-semibold text-tertiary uppercase tracking-widest mb-2 block">Nouveau mot de passe</label>
          <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-neutral focus-within:ring-2 focus:ring-primary transition-all">
            <Lock size={16} className="text-tertiary" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-primary placeholder:text-tertiary"
            />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-semibold text-tertiary uppercase tracking-widest mb-2 block">Confirmer</label>
          <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-neutral focus-within:ring-2 focus:ring-primary transition-all">
            <Lock size={16} className="text-tertiary" />
            <input
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
          {loading ? "Enregistrement..." : <>Réinitialiser <ArrowRight size={16} /></>}
        </button>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-app">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-inverse/15 rounded-2xl flex items-center justify-center text-inverse font-bold">B</div>
          <span className="font-bold text-xl text-inverse">BudGest</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl font-semibold text-inverse leading-tight tracking-tight">
            Choisissez un <br /> nouveau mot de passe.
          </h1>
        </div>
        <div className="text-xs font-semibold text-inverse/50 tracking-wide">
          © 2026 BudGest
        </div>
      </div>

      <div className="flex flex-col justify-center items-center p-8 lg:p-24 bg-white auth-panel">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-primary mb-2">
              Nouveau mot de passe
            </h2>
            <p className="text-tertiary text-sm">Choisissez un mot de passe robuste (8 caractères min).</p>
          </div>
          <Suspense fallback={<div className="h-40" />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
