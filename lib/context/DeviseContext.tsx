"use client";

import { createContext, useContext, useCallback, useSyncExternalStore } from "react";

interface DeviseContextType {
  devise: string;
  symbol: string;
  setDevise: (d: string) => void;
  format: (amount: number) => string;
}

const DEVISE_KEY = "budgest-devise";
const DEVISE_EVENT = "budgest-devise-change";

const deviseSymbols: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  XOF: "FCFA",
};

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(DEVISE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(DEVISE_EVENT, callback);
  };
}

function getSnapshot() {
  return localStorage.getItem(DEVISE_KEY) || "EUR";
}

function getServerSnapshot() {
  return "EUR";
}

const DeviseContext = createContext<DeviseContextType>({
  devise: "EUR",
  symbol: "€",
  setDevise: () => {},
  format: (n) => `${n.toFixed(2)} €`,
});

export function DeviseProvider({ children }: { children: React.ReactNode }) {
  // Même approche que ThemeContext : useSyncExternalStore évite le
  // setState-in-effect et le flash de valeur par défaut avant hydratation.
  const devise = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setDevise = useCallback((d: string) => {
    localStorage.setItem(DEVISE_KEY, d);
    window.dispatchEvent(new Event(DEVISE_EVENT));
  }, []);

  const symbol = deviseSymbols[devise] || "€";

  const format = useCallback(
    (amount: number): string => {
      if (devise === "XOF") {
        return `${Math.round(amount).toLocaleString("fr-FR")} FCFA`;
      }
      return `${amount.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} ${deviseSymbols[devise] || "€"}`;
    },
    [devise],
  );

  return (
    <DeviseContext.Provider value={{ devise, symbol, setDevise, format }}>
      {children}
    </DeviseContext.Provider>
  );
}

export const useDevise = () => useContext(DeviseContext);
