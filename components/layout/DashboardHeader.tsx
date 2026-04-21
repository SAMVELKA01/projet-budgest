"use client";

import { useState } from "react";
import { Search, Bell, HelpCircle, User } from "lucide-react";

export default function DashboardHeader() {
  const [search, setSearch] = useState("");

  return (
    <header className="hidden lg:flex h-16 bg-white border-b border-border items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-3 bg-neutral border border-border rounded-xl px-4 py-2 w-72 focus-within:border-secondary transition-colors">
        <Search size={15} className="text-tertiary" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent outline-none text-sm text-primary placeholder:text-tertiary flex-1"
        />
      </div>

      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 rounded-xl bg-neutral border border-border flex items-center justify-center hover:bg-neutral-dark transition-colors">
          <Bell size={16} className="text-tertiary" />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full"></div>
        </button>
        <button className="w-9 h-9 rounded-xl bg-neutral border border-border flex items-center justify-center hover:bg-neutral-dark transition-colors">
          <HelpCircle size={16} className="text-tertiary" />
        </button>
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary leading-none">Utilisateur</p>
            <p className="text-xs text-tertiary mt-0.5">Mon compte</p>
          </div>
        </div>
      </div>
    </header>
  );
}