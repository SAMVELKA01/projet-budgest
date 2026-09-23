"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Moon, Sun, Bell, Shield, Download, Trash2, Save, User } from "lucide-react";
import { apiPut, apiDelete } from "@/lib/hooks/useApi";
import { useTheme } from "@/lib/context/ThemeContext";
import { useDevise } from "@/lib/context/DeviseContext";
import { useToast } from "@/lib/hooks/useToast";
import ToastContainer from "@/components/ui/Toast";

interface ExportTransaction {
  date: string;
  name: string;
  category: string;
  method: string;
  amount: number;
  type: string;
}

export default function ParametresPage() {
  const { data: session, update } = useSession();
  const { theme, setTheme } = useTheme();
  const { devise, setDevise } = useDevise();
  const { toasts, toast, remove } = useToast();

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [syncedUserId, setSyncedUserId] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [notifications, setNotifications] = useState({ depassement: true, recap: true, objectifs: false });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await apiDelete("/api/users/profile");
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erreur lors de la suppression", "error");
      setDeletingAccount(false);
    }
  };

  // Initialise le formulaire depuis la session une seule fois, quand elle
  // arrive (pas de setState direct dans un effet : ajustement pendant le
  // rendu, cf. doc React "Adjusting state when a prop changes"). La devise
  // est déjà gérée par DeviseProvider (useSyncExternalStore).
  if (session?.user && session.user.id !== syncedUserId) {
    setSyncedUserId(session.user.id);
    setNom(session.user.name || "");
    setEmail(session.user.email || "");
  }

  const handleSaveProfil = async () => {
    if (!nom.trim()) { toast("Le nom ne peut pas être vide", "error"); return; }
    setSaving(true);
    try {
      await apiPut("/api/users/profile", { name: nom, devise });
      await update({ name: nom });
      toast("Profil mis à jour avec succès !", "success");
    } catch {
      toast("Erreur lors de la mise à jour", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast("Tous les champs sont requis", "error"); return;
    }
    if (newPassword.length < 8) {
      toast("Mot de passe trop court (8 caractères min)", "error"); return;
    }
    if (newPassword !== confirmPassword) {
      toast("Les mots de passe ne correspondent pas", "error"); return;
    }
    setSavingPassword(true);
    try {
      await apiPut("/api/users/password", { currentPassword, newPassword });
      toast("Mot de passe modifié avec succès !", "success");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erreur lors du changement", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch("/api/transactions");
      const transactions = await res.json();
      if (!Array.isArray(transactions) || transactions.length === 0) {
        toast("Aucune transaction à exporter", "warning"); return;
      }
      const headers = ["Date", "Description", "Catégorie", "Méthode", "Montant", "Type"];
      const rows = (transactions as ExportTransaction[]).map((t) => [
        new Date(t.date).toLocaleDateString("fr-FR"),
        t.name, t.category, t.method,
        t.amount.toFixed(2), t.type,
      ]);
      const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `budgest-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast("Export CSV téléchargé !", "success");
    } catch {
      toast("Erreur lors de l'export", "error");
    }
  };

  const initials = nom.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="flex flex-col gap-6">
      <ToastContainer toasts={toasts} onRemove={remove} />

      <div>
        <h1 className="text-[28px] font-semibold text-primary" style={{ fontFamily: "var(--font-heading)" }}>Paramètres</h1>
        <p className="text-tertiary text-sm mt-1">Gérez votre profil et vos préférences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profil */}
        <div className="lg:col-span-2 bg-pastel-sand rounded-2xl p-6">
          <h2 className="text-base font-semibold text-ink mb-5 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <User size={16} /> Informations personnelles
          </h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-ink flex items-center justify-center text-white text-xl font-bold shrink-0">{initials}</div>
            <div>
              <p className="text-sm font-semibold text-ink">{nom}</p>
              <p className="text-xs text-ink/60">{email}</p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-ink/60 uppercase tracking-wide mb-2 block">Nom complet</label>
                <input type="text" value={nom} onChange={(e) => setNom(e.target.value)}
                  className="w-full bg-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold transition-all" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-ink/60 uppercase tracking-wide mb-2 block">Email</label>
                <input type="email" value={email} disabled className="w-full bg-white/50 rounded-lg px-4 py-3 text-sm text-ink/50 cursor-not-allowed" />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-ink/60 uppercase tracking-wide mb-2 block">Devise</label>
              <select value={devise} onChange={(e) => setDevise(e.target.value)}
                className="w-full bg-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold transition-all">
                <option value="EUR">Euro (€)</option>
                <option value="USD">Dollar ($)</option>
                <option value="GBP">Livre sterling (£)</option>
                <option value="XOF">Franc CFA (FCFA)</option>
              </select>
              <p className="text-xs text-ink/50 mt-1">La devise sera appliquée sur toute l&apos;application.</p>
            </div>
            <div className="flex justify-end">
              <button onClick={handleSaveProfil} disabled={saving}
                className="bg-ink text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2">
                <Save size={15} />
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
          </div>
        </div>

        {/* Apparence */}
        <div className="bg-pastel-sage rounded-2xl p-6 flex flex-col">
          <h2 className="text-base font-semibold text-ink mb-5" style={{ fontFamily: "var(--font-heading)" }}>Apparence</h2>
          <p className="text-xs text-ink/60 mb-4">Choisissez entre le mode clair et le mode sombre.</p>
          <div className="flex flex-col gap-2">
            <button onClick={() => setTheme("light")}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${theme === "light" ? "bg-white text-ink" : "text-ink/60 hover:bg-white/40"}`}>
              <Sun size={15} /> Clair
            </button>
            <button onClick={() => setTheme("dark")}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${theme === "dark" ? "bg-ink text-white" : "text-ink/60 hover:bg-white/40"}`}>
              <Moon size={15} /> Sombre
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sécurité */}
        <div className="bg-pastel-mauve rounded-2xl p-6">
          <h2 className="text-base font-semibold text-ink mb-5 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <Shield size={16} /> Sécurité
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[11px] font-semibold text-ink/60 uppercase tracking-wide mb-2 block">Mot de passe actuel</label>
              <input type="password" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-ink/60 uppercase tracking-wide mb-2 block">Nouveau</label>
                <input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold transition-all" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-ink/60 uppercase tracking-wide mb-2 block">Confirmer</label>
                <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold transition-all" />
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={handleChangePassword} disabled={savingPassword}
                className="bg-ink text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
                {savingPassword ? "Modification..." : "Changer le mot de passe"}
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-pastel-olive rounded-2xl p-6">
          <h2 className="text-base font-semibold text-ink mb-5 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <Bell size={16} /> Notifications
          </h2>
          <div className="flex flex-col gap-1">
            {[
              { key: "depassement", label: "Dépassement de budget", desc: "Alerte quand vous dépassez un budget." },
              { key: "recap", label: "Récapitulatif mensuel", desc: "Résumé de vos finances chaque fin de mois." },
              { key: "objectifs", label: "Progression des objectifs", desc: "Avancement de vos objectifs." },
            ].map((notif) => (
              <div key={notif.key} className="flex items-center justify-between py-3 border-b border-white/40 last:border-0">
                <div className="min-w-0 pr-3">
                  <p className="text-sm font-semibold text-ink">{notif.label}</p>
                  <p className="text-xs text-ink/50 mt-0.5">{notif.desc}</p>
                </div>
                <button
                  onClick={() => {
                    setNotifications(prev => ({ ...prev, [notif.key]: !prev[notif.key as keyof typeof prev] }));
                    toast("Préférence mise à jour", "success");
                  }}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${notifications[notif.key as keyof typeof notifications] ? "bg-gold" : "bg-white/60"}`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications[notif.key as keyof typeof notifications] ? "translate-x-5 bg-ink" : "translate-x-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Export */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <h2 className="text-base font-semibold text-ink mb-2" style={{ fontFamily: "var(--font-heading)" }}>Données</h2>
          <p className="text-sm text-tertiary mb-4">Exportez vos données personnelles.</p>
          <button onClick={handleExport}
            className="flex items-center gap-2 border border-border text-ink px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-neutral transition-colors">
            <Download size={15} /> Exporter en CSV
          </button>
        </div>

        {/* Danger zone */}
        <div className="bg-white border border-danger/30 rounded-2xl p-6">
          <h2 className="text-base font-bold text-danger mb-2" style={{ fontFamily: "var(--font-heading)" }}>Zone dangereuse</h2>
          <p className="text-sm text-tertiary mb-4">Cette action est irréversible.</p>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 bg-danger text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
              <Trash2 size={15} /> Supprimer mon compte
            </button>
          ) : (
            <div className="bg-danger/10 border border-danger/20 rounded-xl p-4">
              <p className="text-sm font-semibold text-danger mb-3">Êtes-vous certain ? Cette action supprimera toutes vos données.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 border border-border text-tertiary py-2.5 rounded-xl text-sm font-semibold hover:bg-neutral transition-colors">
                  Annuler
                </button>
                <button onClick={handleDeleteAccount} disabled={deletingAccount}
                  className="flex-1 bg-danger text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
                  {deletingAccount ? "Suppression..." : "Confirmer la suppression"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
