import Link from "next/link";
import { Wallet } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-12">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shrink-0">
            <Wallet size={18} className="text-inverse" />
          </div>
          <span className="font-bold text-xl text-primary">BudGest</span>
        </div>

        <div className="text-[120px] font-bold text-neutral-dark leading-none mb-6 tabular-nums">404</div>

        <h1 className="text-[28px] font-semibold text-primary mb-3">Page introuvable</h1>

        <p className="text-base text-tertiary leading-relaxed mb-10">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/dashboard"
            className="bg-primary text-inverse no-underline px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors"
          >
            Tableau de bord →
          </Link>
          <Link
            href="/"
            className="border border-border text-primary no-underline px-6 py-3 rounded-xl text-sm font-semibold hover:bg-neutral transition-colors"
          >
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
