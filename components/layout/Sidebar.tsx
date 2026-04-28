"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, Target, BarChart2, PieChart, Tag, Settings, Plus, LogOut, X, Menu } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";

const navItems = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Budgets", href: "/budgets", icon: PieChart },
  { label: "Objectifs", href: "/objectifs", icon: Target },
  { label: "Analytique", href: "/analytique", icon: BarChart2 },
  { label: "Statistiques", href: "/statistiques", icon: BarChart2 },
  { label: "Catégories", href: "/categories", icon: Tag },
  { label: "Paramètres", href: "/parametres", icon: Settings },
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
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>Nouvelle transaction</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-neutral flex items-center justify-center text-tertiary hover:text-primary transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Description</label>
            <input type="text" placeholder="Ex: Supermarché" value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-secondary transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Montant</label>
              <input type="number" placeholder="0.00" value={form.amount}
                onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-secondary transition-colors" />
            </div>
            <div>
              <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Type</label>
              <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-secondary transition-colors bg-white">
                <option value="depense">Dépense</option>
                <option value="revenu">Revenu</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Catégorie</label>
            <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-secondary transition-colors bg-white">
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Méthode</label>
              <select value={form.method} onChange={(e) => setForm(f => ({ ...f, method: e.target.value }))}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-secondary transition-colors bg-white">
                {["Carte Débit", "Carte Crédit", "Virement SEPA", "Prélèvement", "Espèces", "Apple Pay"].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Date</label>
              <input type="date" value={form.date}
                onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-secondary transition-colors" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border border-border text-tertiary py-3 rounded-xl text-sm font-semibold hover:bg-neutral transition-colors">Annuler</button>
          <button onClick={handleAdd} disabled={saving}
            className="flex-1 bg-primary text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors disabled:opacity-60">
            {saving ? "Ajout..." : "Ajouter →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [showTxModal, setShowTxModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Ferme la sidebar mobile automatiquement quand le pathname change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await signOut({ 
        callbackUrl: "/",
        redirect: true 
      });
    } catch (error) {
      console.error("Erreur déconnexion:", error);
      // Fallback manuel si signOut échoue
      window.location.href = "/login";
    }
  };

  const userName = session?.user?.name || "Mon compte";
  const userEmail = session?.user?.email || "BudGest";
  const initials = userName !== "Mon compte"
    ? userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">B</div>
        <span className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-heading)" }}>BudGest</span>
        <button onClick={() => setMobileOpen(false)} className="ml-auto lg:hidden text-white/50 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all no-underline ${isActive ? "bg-secondary text-white" : "text-white/50 hover:text-white hover:bg-white/10"}`}>
              <IconComponent size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4">
        <button onClick={() => setShowTxModal(true)}
          className="w-full bg-secondary text-white py-3 rounded-xl text-sm font-semibold hover:bg-secondary-hover transition-colors flex items-center justify-center gap-2">
          <Plus size={16} /> Nouvelle transaction
        </button>
      </div>

      <div className="px-3 py-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/05 transition-colors">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 text-white text-xs font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{userName}</p>
            <p className="text-white/40 text-xs truncate">{userEmail}</p>
          </div>
          <button onClick={handleSignOut} title="Se déconnecter"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-danger hover:bg-danger/15 transition-all shrink-0">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 h-screen flex-col bg-primary shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-primary flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-secondary rounded-lg flex items-center justify-center text-white font-bold text-sm">B</div>
          <span className="text-white font-bold text-base" style={{ fontFamily: "var(--font-heading)" }}>BudGest</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="text-white p-1">
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-72 h-full bg-primary flex flex-col">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {showTxModal && <NewTransactionModal onClose={() => setShowTxModal(false)} />}
    </>
  );
}