"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, ShieldOff, KeyRound, ChevronLeft, ChevronRight } from "lucide-react";
import { apiPatch } from "@/lib/hooks/useApi";
import { useToast } from "@/lib/hooks/useToast";
import ToastContainer from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  active: boolean;
  devise: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toasts, toast, remove } = useToast();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{ user: AdminUser; type: "disable" | "enable" } | null>(null);
  const [tempPasswordFor, setTempPasswordFor] = useState<{ user: AdminUser; password: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (session && session.user.role !== "admin") router.push("/dashboard");
  }, [session, status, router]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    if (session?.user.role === "admin") {
      // Rechargement volontaire à chaque changement de filtre/page.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, page, search, roleFilter, statusFilter]);

  const handleToggleRole = async (u: AdminUser) => {
    try {
      await apiPatch(`/api/admin/users/${u._id}`, { role: u.role === "admin" ? "user" : "admin" });
      toast(`${u.name} est maintenant ${u.role === "admin" ? "utilisateur" : "administrateur"}`, "success");
      fetchUsers();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  const handleToggleActive = async () => {
    if (!confirmAction) return;
    const { user: u, type } = confirmAction;
    try {
      await apiPatch(`/api/admin/users/${u._id}`, { active: type === "enable" });
      toast(type === "enable" ? `${u.name} réactivé` : `${u.name} désactivé`, "success");
      fetchUsers();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erreur", "error");
    } finally {
      setConfirmAction(null);
    }
  };

  const handleResetPassword = async (u: AdminUser) => {
    try {
      const res = await fetch(`/api/admin/users/${u._id}/reset-password`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setTempPasswordFor({ user: u, password: data.tempPassword });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ToastContainer toasts={toasts} onRemove={remove} />

      <div>
        <h1 className="text-[28px] font-semibold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
          Utilisateurs
        </h1>
        <p className="text-sm text-tertiary">{total} compte{total > 1 ? "s" : ""} au total.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-border rounded-xl px-3 py-2 flex-1 min-w-[220px]">
          <Search size={15} className="text-tertiary shrink-0" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            className="bg-transparent outline-none text-sm text-primary placeholder:text-tertiary flex-1"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setPage(1); setRoleFilter(e.target.value); }}
          className="border border-border rounded-xl px-3 py-2 text-sm bg-white outline-none"
        >
          <option value="">Tous les rôles</option>
          <option value="user">Utilisateur</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
          className="border border-border rounded-xl px-3 py-2 text-sm bg-white outline-none"
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="disabled">Désactivé</option>
        </select>
      </div>

      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-tertiary">Aucun utilisateur ne correspond à ces filtres.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-xs font-semibold text-tertiary uppercase">Utilisateur</th>
                  <th className="px-5 py-3 text-xs font-semibold text-tertiary uppercase">Rôle</th>
                  <th className="px-5 py-3 text-xs font-semibold text-tertiary uppercase">Statut</th>
                  <th className="px-5 py-3 text-xs font-semibold text-tertiary uppercase">Inscrit le</th>
                  <th className="px-5 py-3 text-xs font-semibold text-tertiary uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-neutral/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-primary">{u.name}</p>
                      <p className="text-xs text-tertiary">{u.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${u.role === "admin" ? "bg-violet/10 text-violet" : "bg-neutral text-tertiary"}`}>
                        {u.role === "admin" ? "Admin" : "Utilisateur"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${u.active ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                        {u.active ? "Actif" : "Désactivé"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-tertiary">
                      {new Date(u.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleRole(u)}
                          title={u.role === "admin" ? "Retirer les droits admin" : "Promouvoir admin"}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-tertiary hover:text-secondary hover:bg-secondary/10 transition-colors"
                        >
                          <ShieldCheck size={15} />
                        </button>
                        <button
                          onClick={() => handleResetPassword(u)}
                          title="Réinitialiser le mot de passe"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-tertiary hover:text-warning hover:bg-warning/10 transition-colors"
                        >
                          <KeyRound size={15} />
                        </button>
                        <button
                          onClick={() => setConfirmAction({ user: u, type: u.active ? "disable" : "enable" })}
                          title={u.active ? "Désactiver le compte" : "Réactiver le compte"}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-tertiary hover:text-danger hover:bg-danger/10 transition-colors"
                        >
                          <ShieldOff size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-tertiary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-sm text-tertiary">Page {page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-tertiary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      {confirmAction && (
        <ConfirmModal
          title={confirmAction.type === "disable" ? "Désactiver ce compte ?" : "Réactiver ce compte ?"}
          message={
            confirmAction.type === "disable"
              ? `${confirmAction.user.name} ne pourra plus se connecter tant que le compte est désactivé.`
              : `${confirmAction.user.name} pourra de nouveau se connecter.`
          }
          confirmLabel={confirmAction.type === "disable" ? "Désactiver" : "Réactiver"}
          danger={confirmAction.type === "disable"}
          onConfirm={handleToggleActive}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {tempPasswordFor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-primary mb-2" style={{ fontFamily: "var(--font-heading)" }}>
              Mot de passe temporaire généré
            </h2>
            <p className="text-sm text-tertiary mb-4">
              Communiquez ce mot de passe à <strong>{tempPasswordFor.user.name}</strong> par un canal sûr.
              Il ne sera plus affiché après fermeture de cette fenêtre.
            </p>
            <div className="bg-neutral border border-border rounded-xl px-4 py-3 font-mono text-sm text-primary mb-5 select-all">
              {tempPasswordFor.password}
            </div>
            <button
              onClick={() => setTempPasswordFor(null)}
              className="w-full bg-primary text-inverse py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors"
            >
              J&apos;ai noté le mot de passe
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
