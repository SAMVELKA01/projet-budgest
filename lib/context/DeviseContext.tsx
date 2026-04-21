"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface DeviseContextType {
  devise: string;
  symbol: string;
  setDevise: (d: string) => void;
  format: (amount: number) => string;
}

const deviseSymbols: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  XOF: "FCFA",
};

const DeviseContext = createContext<DeviseContextType>({
  devise: "EUR",
  symbol: "€",
  setDevise: () => {},
  format: (n) => `${n.toFixed(2)} €`,
});

export function DeviseProvider({ children }: { children: React.ReactNode }) {
  const [devise, setDeviseState] = useState("EUR");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("budgest-devise") || "EUR";
    setDeviseState(saved);
    setMounted(true);
  }, []);

 const setDevise = (d: string) => {
  setDeviseState(d);
  localStorage.setItem("budgest-devise", d);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("budgest-devise-change", { detail: d }));
  }
};
  const symbol = deviseSymbols[devise] || "€";

  const format = (amount: number): string => {
    if (!mounted) return `${amount.toFixed(2)} €`;
    if (devise === "XOF") {
      return `${Math.round(amount).toLocaleString("fr-FR")} FCFA`;
    }
    return `${amount.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${symbol}`;
  };

  return (
    <DeviseContext.Provider value={{ devise, symbol, setDevise, format }}>
      {children}
    </DeviseContext.Provider>
  );
}

export const useDevise = () => useContext(DeviseContext);