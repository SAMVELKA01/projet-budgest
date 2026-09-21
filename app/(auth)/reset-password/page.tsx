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
          <label className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 block">Nouveau mot de passe</label>
          <div className="flex items-center gap-3 border border-border rounded-lg px-4 py-3 bg-neutral focus-within:border-secondary transition-all">
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
          <label className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 block">Confirmer</label>
          <div className="flex items-center gap-3 border border-border rounded-lg px-4 py-3 bg-neutral focus-within:border-secondary transition-all">
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
          className="w-full bg-primary text-white py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-2"
        >
          {loading ? "Enregistrement..." : <>Réinitialiser <ArrowRight size={16} /></>}
        </button>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-neutral border-r border-border">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold">B</div>
          <span className="font-bold text-xl text-primary" style={{ fontFamily: "var(--font-heading)" }}>BudGest</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-primary leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Choisissez un <br /> nouveau mot de passe.
          </h1>
        </div>
        <div className="text-xs font-semibold text-tertiary tracking-widest uppercase">
          © 2026 BudGest — L&apos;observatoire de l&apos;équilibre
        </div>
      </div>

      <div className="flex flex-col justify-center items-center p-8 lg:p-24">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-primary mb-2" style={{ fontFamily: "var(--font-heading)" }}>
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
