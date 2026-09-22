"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/hooks/useApi";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("Tous les champs sont requis");
      return;
    }
    if (form.password.length < 8) {
      setError("Mot de passe trop court (8 caractères minimum)");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      await apiPost("/api/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      router.push("/login?registered=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création du compte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-app">
      {/* SECTION GAUCHE : Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-inverse/15 rounded-2xl flex items-center justify-center text-inverse font-bold">B</div>
          <span className="font-bold text-xl text-inverse">BudGest</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-semibold text-inverse leading-tight tracking-tight">
            Commencez votre <br/> voyage financier.
          </h1>
          <p className="text-inverse/70 max-w-sm text-base leading-relaxed">
            Rejoignez des milliers d&apos;utilisateurs qui maîtrisent leur budget avec BudGest.
          </p>
        </div>

        <div className="text-xs font-semibold text-inverse/50 tracking-wide">
          © 2026 BudGest
        </div>
      </div>

      {/* SECTION DROITE : Formulaire */}
      <div className="flex flex-col justify-center items-center p-8 lg:p-24 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-primary mb-2">Créer un compte</h2>
            <p className="text-tertiary text-sm">Prêt à reprendre le contrôle ?</p>
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/20 rounded-xl px-4 py-3 mb-6">
              <p className="text-sm text-danger font-medium">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Input Name */}
            <div>
              <label className="text-[11px] font-semibold text-tertiary uppercase tracking-widest mb-2 block">Nom complet</label>
              <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-neutral focus-within:ring-2 focus:ring-primary transition-all">
                <User size={16} className="text-tertiary" />
                <input type="text" placeholder="Jean Dupont" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="flex-1 bg-transparent outline-none text-sm text-primary" />
              </div>
            </div>

            {/* Input Email */}
            <div>
              <label className="text-[11px] font-semibold text-tertiary uppercase tracking-widest mb-2 block">Email</label>
              <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-neutral focus-within:ring-2 focus:ring-primary transition-all">
                <Mail size={16} className="text-tertiary" />
                <input type="email" placeholder="nom@exemple.com" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} className="flex-1 bg-transparent outline-none text-sm text-primary" />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label className="text-[11px] font-semibold text-tertiary uppercase tracking-widest mb-2 block">Mot de passe</label>
              <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-neutral focus-within:ring-2 focus:ring-primary transition-all">
                <Lock size={16} className="text-tertiary" />
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} className="flex-1 bg-transparent outline-none text-sm text-primary" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-tertiary hover:text-primary">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              {form.password && (
                <div className="flex gap-1 mt-2">
                  {[0, 1, 2, 3].map((i) => {
                    const strength = [form.password.length >= 8, /[A-Z]/.test(form.password), /[0-9]/.test(form.password), /[^A-Za-z0-9]/.test(form.password)].filter(Boolean).length;
                    const active = i < strength;
                    const color = strength <= 1 ? "bg-danger" : strength === 2 ? "bg-warning" : "bg-success";
                    return <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${active ? color : "bg-border"}`} />;
                  })}
                </div>
              )}
            </div>

            {/* Input Confirm */}
            <div>
              <label className="text-[11px] font-semibold text-tertiary uppercase tracking-widest mb-2 block">Confirmer</label>
              <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-neutral focus-within:ring-2 focus:ring-primary transition-all">
                <Lock size={16} className="text-tertiary" />
                <input type={showConfirm ? "text" : "password"} placeholder="••••••••" value={form.confirm} onChange={(e) => setForm(f => ({ ...f, confirm: e.target.value }))} className="flex-1 bg-transparent outline-none text-sm text-primary" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-tertiary hover:text-primary">{showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-primary text-inverse py-3.5 rounded-full font-semibold text-sm hover:bg-primary-light transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              {loading ? "Création..." : <>Créer mon compte <ArrowRight size={16} /></>}
            </button>
          </div>

          <p className="text-center text-sm text-tertiary mt-8">
            Déjà inscrit ?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}