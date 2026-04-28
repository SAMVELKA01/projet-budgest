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
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création du compte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* SECTION GAUCHE : Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-neutral border-r border-border">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold">B</div>
          <span className="font-bold text-xl text-primary" style={{ fontFamily: "var(--font-heading)" }}>BudGest</span>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-primary leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Commencez votre <br/> voyage financier.
          </h1>
          <p className="text-tertiary max-w-sm">
            Rejoignez des milliers d'utilisateurs qui maîtrisent leur équilibre financier avec BudGest.
          </p>
        </div>

        <div className="text-xs font-semibold text-tertiary tracking-widest uppercase">
          © 2026 BudGest — L'observatoire de l'équilibre
        </div>
      </div>

      {/* SECTION DROITE : Formulaire */}
      <div className="flex flex-col justify-center items-center p-8 lg:p-24">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-primary mb-2" style={{ fontFamily: "var(--font-heading)" }}>Créer un compte</h2>
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
              <label className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 block">Nom complet</label>
              <div className="flex items-center gap-3 border border-border rounded-lg px-4 py-3 bg-neutral focus-within:border-secondary transition-all">
                <User size={16} className="text-tertiary" />
                <input type="text" placeholder="Jean Dupont" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="flex-1 bg-transparent outline-none text-sm text-primary" />
              </div>
            </div>

            {/* Input Email */}
            <div>
              <label className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 block">Email</label>
              <div className="flex items-center gap-3 border border-border rounded-lg px-4 py-3 bg-neutral focus-within:border-secondary transition-all">
                <Mail size={16} className="text-tertiary" />
                <input type="email" placeholder="nom@exemple.com" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} className="flex-1 bg-transparent outline-none text-sm text-primary" />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 block">Mot de passe</label>
              <div className="flex items-center gap-3 border border-border rounded-lg px-4 py-3 bg-neutral focus-within:border-secondary transition-all">
                <Lock size={16} className="text-tertiary" />
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} className="flex-1 bg-transparent outline-none text-sm text-primary" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-tertiary hover:text-secondary"><Eye size={16} /></button>
              </div>
            </div>

            {/* Input Confirm */}
            <div>
              <label className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 block">Confirmer</label>
              <div className="flex items-center gap-3 border border-border rounded-lg px-4 py-3 bg-neutral focus-within:border-secondary transition-all">
                <Lock size={16} className="text-tertiary" />
                <input type={showConfirm ? "text" : "password"} placeholder="••••••••" value={form.confirm} onChange={(e) => setForm(f => ({ ...f, confirm: e.target.value }))} className="flex-1 bg-transparent outline-none text-sm text-primary" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-tertiary hover:text-secondary"><Eye size={16} /></button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-2"
            >
              {loading ? "Création..." : <>Créer mon compte <ArrowRight size={16} /></>}
            </button>
          </div>

          <p className="text-center text-sm text-tertiary mt-8">
            Déjà inscrit ?{" "}
            <Link href="/login" className="text-secondary font-semibold hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}