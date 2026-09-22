"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen grid lg:grid-cols-2 bg-app">
      {/* SECTION GAUCHE : Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-inverse/15 rounded-2xl flex items-center justify-center text-inverse font-bold">B</div>
          <span className="font-bold text-xl text-inverse">BudGest</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-semibold text-inverse leading-tight tracking-tight">
            Reprenez le contrôle <br/> de vos finances.
          </h1>
          <p className="text-inverse/70 max-w-sm text-base leading-relaxed">
            BudGest suit vos revenus, vos dépenses et vos objectifs — avec un assistant IA qui répond à vos questions.
          </p>
        </div>

        <div className="text-xs font-semibold text-inverse/50 tracking-wide">
          © 2026 BudGest
        </div>
      </div>

      {/* SECTION DROITE : Formulaire */}
      <div className="flex flex-col justify-center items-center p-8 lg:p-24 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <h2 className="text-3xl font-semibold text-primary mb-2">Connexion</h2>
            <p className="text-tertiary text-sm">Accédez à votre espace financier.</p>
          </div>

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
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  className="flex-1 bg-transparent outline-none text-sm text-primary placeholder:text-tertiary"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] font-semibold text-tertiary uppercase tracking-widest">Mot de passe</label>
                <Link href="/forgot-password" className="text-xs text-primary font-semibold hover:underline">Oublié ?</Link>
              </div>
              <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-neutral focus-within:ring-2 focus:ring-primary transition-all">
                <Lock size={16} className="text-tertiary" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="flex-1 bg-transparent outline-none text-sm text-primary placeholder:text-tertiary"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-tertiary hover:text-primary">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-primary text-inverse py-3.5 rounded-full font-semibold text-sm hover:bg-primary-light transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              {loading ? "Connexion..." : <>Se connecter <ArrowRight size={16} /></>}
            </button>
          </div>

          <p className="text-center text-sm text-tertiary mt-8">
            Nouveau ici ?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">Créer un compte</Link>
          </p>
        </div>
      </div>
    </div>
  );
}