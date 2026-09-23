"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, Target, BarChart2, PieChart, Tag, Settings, Plus, LogOut, X, Menu, ShieldCheck, Users, Sparkles } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

const navItems = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { label: "Assistant IA", href: "/assistant", icon: Sparkles },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Budgets", href: "/budgets", icon: PieChart },
  { label: "Objectifs", href: "/objectifs", icon: Target },
  { label: "Statistiques", href: "/statistiques", icon: BarChart2 },
  { label: "Catégories", href: "/categories", icon: Tag },
  { label: "Paramètres", href: "/parametres", icon: Settings },
];

const adminNavItems = [
  { label: "Vue d'ensemble", href: "/admin", icon: ShieldCheck },
  { label: "Utilisateurs", href: "/admin/users", icon: Users },
];

function NewTransactionModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: "", amount: "", type: "depense", category: "Alimentation", method: "Carte Débit", date: "" });
  const [saving, setSaving] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const categories = ["Alimentation", "Logement", "Transport", "Loisirs", "Abonnements", "Santé", "Revenus"];

  const handleAdd = async () => {
    if (!form.name || !form.amount) return;
    setSaving(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount), date: form.date || new Date().toISOString() }),
      });
      if (res.ok) {
        onClose();
        // Rafraîchit la page transactions si on y est déjà
        if (pathname === "/transactions") {
          router.refresh();
        }
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-pastel-sage flex items-center justify-center shrink-0">
            <Plus size={18} className="text-ink" />
          </div>
          <h2 className="text-lg font-semibold text-ink flex-1" style={{ fontFamily: "var(--font-heading)" }}>Nouvelle transaction</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-neutral flex items-center justify-center text-tertiary hover:text-ink transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[11px] font-semibold text-tertiary uppercase tracking-wide mb-2 block">Description</label>
            <input type="text" placeholder="Ex: Supermarché" value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-neutral rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-tertiary uppercase tracking-wide mb-2 block">Montant</label>
              <input type="number" placeholder="0.00" value={form.amount}
                onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                className="w-full bg-neutral rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary transition-all" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-tertiary uppercase tracking-wide mb-2 block">Type</label>
              <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full bg-neutral rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary transition-all">
                <option value="depense">Dépense</option>
                <option value="revenu">Revenu</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-tertiary uppercase tracking-wide mb-2 block">Catégorie</label>
            <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full bg-neutral rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary transition-all">
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-tertiary uppercase tracking-wide mb-2 block">Méthode</label>
              <select value={form.method} onChange={(e) => setForm(f => ({ ...f, method: e.target.value }))}
                className="w-full bg-neutral rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary transition-all">
                {["Carte Débit", "Carte Crédit", "Virement SEPA", "Prélèvement", "Espèces", "Apple Pay"].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-tertiary uppercase tracking-wide mb-2 block">Date</label>
              <input type="date" value={form.date}
                onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full bg-neutral rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary transition-all" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border border-border text-tertiary py-3 rounded-xl text-sm font-semibold hover:bg-neutral transition-colors">Annuler</button>
          <button onClick={handleAdd} disabled={saving}
            className="flex-1 bg-ink text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
            {saving ? "Ajout..." : "Ajouter →"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface SessionUser {
  role?: string;
  name?: string | null;
  email?: string | null;
}

function SidebarContent({
  session,
  onCloseMobile,
  onNewTransaction,
  onSignOut,
}: {
  session: { user?: SessionUser } | null;
  onCloseMobile: () => void;
  onNewTransaction: () => void;
  onSignOut: () => void;
}) {
  const pathname = usePathname();
  const isAdmin = session?.user?.role === "admin";
  const currentNavItems = isAdmin ? adminNavItems : navItems;

  const userName = session?.user?.name || "Mon compte";
  const userEmail = session?.user?.email || "BudGest";
  const initials = userName !== "Mon compte"
    ? userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <>
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-inverse font-bold text-sm shrink-0">B</div>
        <span className="text-primary font-bold text-lg" style={{ fontFamily: "var(--font-heading)" }}>BudGest</span>
        <button onClick={onCloseMobile} className="ml-auto lg:hidden text-primary/50 hover:text-primary">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1.5 overflow-y-auto">
        {currentNavItems.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all no-underline ${isActive ? "text-primary" : "text-primary/45 hover:text-primary hover:bg-primary/5"}`}>
              <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${isActive ? "bg-gold text-ink" : ""}`}>
                <IconComponent size={17} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {!isAdmin && (
        <div className="px-3 pb-4">
          <button onClick={onNewTransaction}
            className="w-full bg-gold text-ink py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <Plus size={16} /> Nouvelle transaction
          </button>
        </div>
      )}

      <div className="px-3 py-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/5 transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary text-xs font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-primary text-xs font-semibold truncate">{userName}</p>
            <p className="text-primary/45 text-xs truncate">{userEmail}</p>
          </div>
          <button onClick={onSignOut} title="Se déconnecter"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-primary/40 hover:text-danger hover:bg-danger/10 transition-all shrink-0">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [showTxModal, setShowTxModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  // Ferme la sidebar mobile automatiquement quand le pathname change.
  // Ajustement pendant le rendu plutôt que dans un effet : on évite un
  // aller-retour de rendu supplémentaire (cf. doc React "Adjusting state
  // when a prop changes").
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

  const handleSignOut = async () => {
    try {
      await signOut({ 
        callbackUrl: "/",
        redirect: true 
      });
    } catch (error) {
      console.error("Erreur déconnexion:", error);
      // Fallback manuel si signOut échoue
      router.push("/login");
    }
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 h-screen flex-col bg-sidebar shrink-0">
        <SidebarContent
          session={session ?? null}
          onCloseMobile={() => setMobileOpen(false)}
          onNewTransaction={() => setShowTxModal(true)}
          onSignOut={handleSignOut}
        />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-sidebar flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-inverse font-bold text-sm">B</div>
          <span className="text-primary font-bold text-base" style={{ fontFamily: "var(--font-heading)" }}>BudGest</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="text-primary p-1">
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-72 h-full bg-sidebar flex flex-col">
            <SidebarContent
              session={session ?? null}
              onCloseMobile={() => setMobileOpen(false)}
              onNewTransaction={() => setShowTxModal(true)}
              onSignOut={handleSignOut}
            />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {showTxModal && <NewTransactionModal onClose={() => setShowTxModal(false)} />}
    </>
  );
}