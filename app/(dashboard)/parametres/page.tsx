"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Moon, Sun, Bell, Shield, Download, Trash2, Save } from "lucide-react";
import { apiPut } from "@/lib/hooks/useApi";
import { useTheme } from "@/lib/context/ThemeContext";
import { useDevise } from "@/lib/context/DeviseContext";
import { useToast } from "@/lib/hooks/useToast";
import ToastContainer from "@/components/ui/Toast";

export default function ParametresPage() {
  const { data: session, update } = useSession();
  const { theme, setTheme } = useTheme();
  const { devise, setDevise } = useDevise();
  const { toasts, toast, remove } = useToast();

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    depassement: true,
    recap: true,
    objectifs: false,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setNom(session.user.name || "");
      setEmail(session.user.email || "");
      const savedDevise = localStorage.getItem("budgest-devise");
      if (savedDevise) setDevise(savedDevise);
    }
  }, [session]);

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
    } catch (err: any) {
      toast(err.message || "Erreur lors du changement", "error");
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
      const rows = transactions.map((t: any) => [
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
    <div className="flex flex-col gap-6 max-w-3xl">
      <ToastContainer toasts={toasts} onRemove={remove} />

      <div>
        <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>Paramètres</h1>
        <p className="text-tertiary text-sm mt-1">Gérez votre profil et vos préférences.</p>
      </div>

      {/* Profil */}
      <div className="bg-white border border-border rounded-2xl p-6">
        <h2 className="text-base font-bold text-primary mb-5" style={{ fontFamily: "var(--font-heading)" }}>
          Informations personnelles
        </h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-white text-xl font-bold shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">{nom}</p>
            <p className="text-xs text-tertiary">{email}</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Nom complet</label>
              <input type="text" value={nom} onChange={(e) => setNom(e.target.value)}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-secondary transition-colors" />
            </div>
            <div>
              <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Email</label>
              <input type="email" value={email} disabled
                className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-neutral text-tertiary cursor-not-allowed" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Devise</label>
            <select value={devise} onChange={(e) => setDevise(e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-secondary transition-colors bg-white">
              <option value="EUR">Euro (€)</option>
              <option value="USD">Dollar ($)</option>
              <option value="GBP">Livre sterling (£)</option>
              <option value="XOF">Franc CFA (FCFA)</option>
            </select>
            <p className="text-xs text-tertiary mt-1">La devise sera appliquée sur toute l'application.</p>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSaveProfil} disabled={saving}
              className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors disabled:opacity-60 flex items-center gap-2">
              <Save size={15} />
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </div>
        </div>
      </div>

      {/* Thème */}
      <div className="bg-white border border-border rounded-2xl p-6">
        <h2 className="text-base font-bold text-primary mb-5" style={{ fontFamily: "var(--font-heading)" }}>
          Apparence
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Thème de l'application</p>
            <p className="text-xs text-tertiary mt-0.5">Choisissez entre le mode clair et le mode sombre.</p>
          </div>
          <div className="flex gap-2 bg-neutral border border-border rounded-xl p-1">
            <button onClick={() => setTheme("light")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${theme === "light" ? "bg-white border border-border text-primary shadow-sm" : "text-tertiary hover:text-primary"}`}>
              <Sun size={15} /> Clair
            </button>
            <button onClick={() => setTheme("dark")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${theme === "dark" ? "bg-primary text-white" : "text-tertiary hover:text-primary"}`}>
              <Moon size={15} /> Sombre
            </button>
          </div>
        </div>
      </div>

      {/* Mot de passe */}
      <div className="bg-white border border-border rounded-2xl p-6">
        <h2 className="text-base font-bold text-primary mb-5" style={{ fontFamily: "var(--font-heading)" }}>
          <Shield size={16} className="inline mr-2 text-tertiary" />
          Sécurité
        </h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Mot de passe actuel</label>
            <input type="password" placeholder="••••••••" value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-secondary transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Nouveau mot de passe</label>
              <input type="password" placeholder="••••••••" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-secondary transition-colors" />
            </div>
            <div>
              <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">Confirmer</label>
              <input type="password" placeholder="••••••••" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-secondary transition-colors" />
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleChangePassword} disabled={savingPassword}
              className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors disabled:opacity-60">
              {savingPassword ? "Modification..." : "Changer le mot de passe"}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white border border-border rounded-2xl p-6">
        <h2 className="text-base font-bold text-primary mb-5" style={{ fontFamily: "var(--font-heading)" }}>
          <Bell size={16} className="inline mr-2 text-tertiary" />
          Notifications
        </h2>
        <div className="flex flex-col gap-4">
          {[
            { key: "depassement", label: "Alertes de dépassement de budget", desc: "Recevez une alerte quand vous dépassez un budget." },
            { key: "recap", label: "Récapitulatif mensuel", desc: "Un résumé de vos finances chaque fin de mois." },
            { key: "objectifs", label: "Progression des objectifs", desc: "Notifications sur l'avancement de vos objectifs." },
          ].map((notif) => (
            <div key={notif.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-semibold text-primary">{notif.label}</p>
                <p className="text-xs text-tertiary mt-0.5">{notif.desc}</p>
              </div>
              <button
                onClick={() => {
                  setNotifications(prev => ({ ...prev, [notif.key]: !prev[notif.key as keyof typeof prev] }));
                  toast("Préférence mise à jour", "success");
                }}
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${notifications[notif.key as keyof typeof notifications] ? "bg-secondary" : "bg-border"}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications[notif.key as keyof typeof notifications] ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Export & Danger */}
      <div className="bg-white border border-border rounded-2xl p-6">
        <h2 className="text-base font-bold text-primary mb-2" style={{ fontFamily: "var(--font-heading)" }}>Données</h2>
        <p className="text-sm text-tertiary mb-4">Exportez ou supprimez vos données personnelles.</p>
        <div className="flex gap-3">
          <button onClick={handleExport}
            className="flex items-center gap-2 border border-border text-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-neutral transition-colors">
            <Download size={15} /> Exporter en CSV
          </button>
        </div>
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
              <button onClick={() => toast("Fonctionnalité bientôt disponible", "warning")}
                className="flex-1 bg-danger text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
                Confirmer la suppression
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}