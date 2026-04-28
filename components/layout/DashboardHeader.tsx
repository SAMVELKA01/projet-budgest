"use client";

import { useState } from "react";
import { Search, Bell, HelpCircle, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardHeader() {
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const userName = session?.user?.name || "Utilisateur";
  const userEmail = session?.user?.email || "";
  const initials = userName !== "Utilisateur"
    ? userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim()) {
      router.push(`/transactions?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  return (
    <header className="hidden lg:flex h-16 bg-white border-b border-border items-center justify-between px-6 flex-shrink-0">

      {/* Recherche */}
      <div className="flex items-center gap-3 bg-neutral border border-border rounded-xl px-4 py-2 w-72 focus-within:border-secondary transition-colors">
        <Search size={15} className="text-tertiary flex-shrink-0" />
        <input
          type="text"
          placeholder="Rechercher une transaction..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          className="bg-transparent outline-none text-sm text-primary placeholder:text-tertiary flex-1"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-tertiary hover:text-primary transition-colors">
            <X size={13} />
          </button>
        )}
      </div>

      {/* Actions droite */}
      <div className="flex items-center gap-3">

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl bg-neutral border border-border flex items-center justify-center hover:bg-neutral-dark transition-colors">
          <Bell size={16} className="text-tertiary" />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
        </button>

        {/* Aide */}
        <button
          onClick={() => router.push("/parametres")}
          className="w-9 h-9 rounded-xl bg-neutral border border-border flex items-center justify-center hover:bg-neutral-dark transition-colors">
          <HelpCircle size={16} className="text-tertiary" />
        </button>

        {/* Avatar */}
        <div
          onClick={() => router.push("/parametres")}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-primary leading-none">{userName}</p>
            <p className="text-xs text-tertiary mt-0.5">{userEmail}</p>
          </div>
        </div>

      </div>
    </header>
  );
}