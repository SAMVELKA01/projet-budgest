import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-neutral flex flex-col">

      {/* Header */}
      <div className="flex justify-between items-center px-8 py-5 border-b border-border">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center text-white font-bold text-sm">
            B
          </div>
          <span className="font-bold text-lg text-primary" style={{ fontFamily: "var(--font-heading)" }}>
            BudGest
          </span>
        </Link>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Logo centré */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl" style={{ fontFamily: "var(--font-heading)" }}>B</span>
            </div>
            <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
              BudGest
            </h1>
            <p className="text-tertiary text-sm mt-1">L'Observatoire de l'Équilibre</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-border p-8">
            <h2 className="text-xl font-bold text-primary mb-1" style={{ fontFamily: "var(--font-heading)" }}>
              Créer un compte
            </h2>
            <p className="text-tertiary text-sm mb-6">Rejoignez des milliers d'utilisateurs qui maîtrisent leur budget.</p>

            <div className="flex flex-col gap-4">

              {/* Nom complet */}
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">
                  Nom complet
                </label>
                <div className="flex items-center gap-3 border border-border rounded-lg px-4 py-3 bg-neutral focus-within:border-secondary transition-colors">
                  <span className="text-tertiary text-sm">👤</span>
                  <input
                    type="text"
                    placeholder="Jean Dupont"
                    className="flex-1 bg-transparent outline-none text-sm text-primary placeholder:text-tertiary"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">
                  Email
                </label>
                <div className="flex items-center gap-3 border border-border rounded-lg px-4 py-3 bg-neutral focus-within:border-secondary transition-colors">
                  <span className="text-tertiary text-sm">✉</span>
                  <input
                    type="email"
                    placeholder="nom@exemple.com"
                    className="flex-1 bg-transparent outline-none text-sm text-primary placeholder:text-tertiary"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">
                  Mot de passe
                </label>
                <div className="flex items-center gap-3 border border-border rounded-lg px-4 py-3 bg-neutral focus-within:border-secondary transition-colors">
                  <span className="text-tertiary text-sm">🔒</span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="flex-1 bg-transparent outline-none text-sm text-primary placeholder:text-tertiary"
                  />
                </div>
                <p className="text-xs text-tertiary mt-1">Minimum 8 caractères</p>
              </div>

              {/* Confirmer mot de passe */}
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">
                  Confirmer le mot de passe
                </label>
                <div className="flex items-center gap-3 border border-border rounded-lg px-4 py-3 bg-neutral focus-within:border-secondary transition-colors">
                  <span className="text-tertiary text-sm">🔒</span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="flex-1 bg-transparent outline-none text-sm text-primary placeholder:text-tertiary"
                  />
                </div>
              </div>

              {/* CGU */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="cgu"
                  className="mt-1 accent-secondary"
                />
                <label htmlFor="cgu" className="text-xs text-tertiary leading-relaxed">
                  J'accepte les{" "}
                  <Link href="/mentions-legales" className="text-secondary no-underline hover:underline">
                    mentions légales
                  </Link>{" "}
                  et la{" "}
                  <Link href="/confidentialite" className="text-secondary no-underline hover:underline">
                    politique de confidentialité
                  </Link>
                </label>
              </div>

              {/* Bouton */}
              <button className="w-full bg-primary text-white py-3 rounded-lg font-semibold text-sm mt-2 hover:bg-primary-light transition-colors flex items-center justify-center gap-2">
                Créer mon compte →
              </button>

            </div>

            {/* Login link */}
            <p className="text-center text-sm text-tertiary mt-6">
              Déjà un compte ?{" "}
              <Link href="/login" className="text-secondary font-semibold no-underline hover:underline">
                Se connecter
              </Link>
            </p>
          </div>

          {/* Sécurité */}
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
            <a key={item} href="#" className="text-xs text-tertiary no-underline hover:text-primary transition-colors">
              {item}
            </a>
          ))}
        </div>
        <span className="text-xs text-tertiary">© 2024 BUDGEST</span>
      </div>

    </div>
  );
}