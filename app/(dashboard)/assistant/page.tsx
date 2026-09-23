"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, TrendingUp, Lightbulb, MessageCircle, AlertTriangle, CheckCircle, Info, Calculator, PiggyBank, Tag } from "lucide-react";
import { useDevise } from "@/lib/context/DeviseContext";

type Tab = "chat" | "insights" | "forecast";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Insight {
  title: string;
  message: string;
  severity: "info" | "warning" | "success";
}

interface ForecastData {
  history: { month: string; revenus: number; depenses: number }[];
  projected: { month: string; projectedRevenus: number; projectedDepenses: number }[];
  narrative: string;
}

interface DashboardStats {
  depenses: number;
  depensesByCategory: Record<string, number>;
}

const severityConfig = {
  info: { icon: Info, color: "text-info", bg: "bg-pastel-sage" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-pastel-olive" },
  success: { icon: CheckCircle, color: "text-success", bg: "bg-pastel-sand" },
};

async function fetchJsonOrThrow(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Erreur du service IA");
  return data;
}

function AperçuRapide() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { format } = useDevise();

  useEffect(() => {
    fetch("/api/dashboard/stats").then((r) => (r.ok ? r.json() : null)).then((d) => d && setStats(d)).catch(() => {});
  }, []);

  if (!stats) return null;

  const topCat = Object.entries(stats.depensesByCategory).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
      <div className="bg-pastel-sand rounded-2xl p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-white/60 flex items-center justify-center shrink-0"><Calculator size={16} className="text-ink" /></div>
        <div className="min-w-0">
          <p className="text-[10px] font-medium text-ink/50 uppercase tracking-wider">Dépenses ce mois</p>
          <p className="text-lg font-bold text-ink tabular-nums truncate">{format(stats.depenses)}</p>
        </div>
      </div>
      {topCat && (
        <div className="bg-pastel-mauve rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/60 flex items-center justify-center shrink-0"><Tag size={16} className="text-ink" /></div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-ink/50 uppercase tracking-wider">Plus grosse catégorie</p>
            <p className="text-lg font-bold text-ink truncate">{topCat[0]} · {format(topCat[1])}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const suggestions = [
    { q: "Combien ai-je dépensé ce mois-ci ?", icon: Calculator, bg: "bg-pastel-sand" },
    { q: "Quelle est ma plus grosse catégorie de dépense ?", icon: Tag, bg: "bg-pastel-sage" },
    { q: "Suis-je dans mes budgets ce mois-ci ?", icon: PiggyBank, bg: "bg-pastel-mauve" },
  ];

  const send = async (question: string) => {
    if (!question.trim() || loading) return;
    setError("");
    setMessages((m) => [...m, { role: "user", content: question }]);
    setInput("");
    setLoading(true);
    try {
      const data = await fetchJsonOrThrow("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      setMessages((m) => [...m, { role: "assistant", content: data.answer }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {messages.length === 0 && <AperçuRapide />}
      <div className="bg-white border border-border rounded-2xl flex flex-col h-[480px]">
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-5">
              <div className="w-14 h-14 rounded-full bg-pastel-sand flex items-center justify-center">
                <Sparkles size={24} className="text-ink" />
              </div>
              <p className="text-sm text-tertiary max-w-xs">
                Posez une question sur vos finances en langage naturel. Je réponds uniquement à partir de vos données.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full max-w-lg">
                {suggestions.map((s) => (
                  <button key={s.q} onClick={() => send(s.q)}
                    className={`${s.bg} text-left rounded-xl px-3 py-3 flex flex-col gap-2 hover:opacity-80 transition-opacity`}>
                    <s.icon size={16} className="text-ink" />
                    <span className="text-xs font-medium text-ink leading-snug">{s.q}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm tabular-nums ${m.role === "user" ? "bg-ink text-white" : "bg-neutral text-ink border border-border"}`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-neutral rounded-2xl px-4 py-2.5">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-bounce" />
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="bg-danger/10 border border-danger/20 rounded-xl px-4 py-3">
              <p className="text-sm text-danger font-medium">{error}</p>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div className="border-t border-border p-3 flex items-center gap-2">
          <input
            type="text"
            placeholder="Posez votre question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            className="flex-1 bg-neutral rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold transition-all"
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-full bg-gold text-ink flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </>
  );
}

function InsightsPanel() {
  const [insights, setInsights] = useState<Insight[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJsonOrThrow("/api/ai/insights")
      .then((data) => setInsights(data.insights))
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-ink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger/10 border border-danger/20 rounded-2xl px-5 py-4">
        <p className="text-sm text-danger font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {insights?.map((insight, i) => {
        const { icon: Icon, color, bg } = severityConfig[insight.severity] || severityConfig.info;
        return (
          <div key={i} className={`${bg} rounded-2xl p-5 flex gap-3`}>
            <div className="w-9 h-9 rounded-full bg-white/60 flex items-center justify-center shrink-0">
              <Icon size={16} className={color} />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">{insight.title}</p>
              <p className="text-xs text-ink/60 mt-1 leading-relaxed">{insight.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ForecastPanel() {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { format } = useDevise();

  useEffect(() => {
    fetchJsonOrThrow("/api/ai/forecast")
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-ink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger/10 border border-danger/20 rounded-2xl px-5 py-4">
        <p className="text-sm text-danger font-medium">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const allMonths = [
    ...data.history.map((h) => ({ month: h.month, revenus: h.revenus, depenses: h.depenses, projected: false })),
    ...data.projected.map((p) => ({ month: p.month, revenus: p.projectedRevenus, depenses: p.projectedDepenses, projected: true })),
  ];
  const max = Math.max(...allMonths.map((m) => Math.max(m.revenus, m.depenses)), 1);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={18} className="text-info" />
          <h3 className="font-semibold text-ink" style={{ fontFamily: "var(--font-heading)" }}>Historique &amp; prévisions</h3>
        </div>
        <div className="flex items-end gap-2" style={{ height: "160px" }}>
          {allMonths.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="flex items-end gap-0.5 w-full" style={{ height: "130px" }}>
                <div className="flex-1 rounded-t-md" style={{ height: `${(m.revenus / max) * 130}px`, background: m.projected ? "#4CAF7D80" : "#4CAF7D", minHeight: m.revenus > 0 ? "3px" : "0" }} />
                <div className="flex-1 rounded-t-md" style={{ height: `${(m.depenses / max) * 130}px`, background: m.projected ? "#E15B5B80" : "#E15B5B", minHeight: m.depenses > 0 ? "3px" : "0" }} />
              </div>
              <span className={`text-[10px] ${m.projected ? "text-tertiary italic" : "text-tertiary"}`}>{m.month}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-tertiary bg-neutral px-2.5 py-1 rounded-full"><span className="w-2.5 h-2.5 rounded-full bg-success inline-block" /> Revenus</span>
          <span className="inline-flex items-center gap-1.5 text-xs text-tertiary bg-neutral px-2.5 py-1 rounded-full"><span className="w-2.5 h-2.5 rounded-full bg-danger inline-block" /> Dépenses</span>
          <span className="inline-flex items-center gap-1.5 text-xs text-tertiary bg-neutral px-2.5 py-1 rounded-full"><span className="w-2.5 h-2.5 rounded-full bg-tertiary/50 inline-block" /> Projection</span>
        </div>
      </div>

      <div className="bg-pastel-mauve rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={18} className="text-ink" />
          <h3 className="font-semibold text-ink" style={{ fontFamily: "var(--font-heading)" }}>Analyse</h3>
          <span className="ml-auto text-[10px] font-bold text-ink/50 uppercase tracking-wider">Généré par l&apos;IA</span>
        </div>
        <p className="text-sm text-ink/80 leading-relaxed">{data.narrative}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {data.projected.map((p, i) => (
          <div key={i} className="bg-white border border-border rounded-2xl p-5">
            <p className="text-[11px] font-medium text-tertiary uppercase tracking-wider mb-2">{p.month}</p>
            <p className="text-sm text-success font-bold tabular-nums">+{format(p.projectedRevenus)}</p>
            <p className="text-sm text-danger font-bold tabular-nums">-{format(p.projectedDepenses)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AssistantPage() {
  const [tab, setTab] = useState<Tab>("chat");

  const tabs: { key: Tab; label: string; icon: typeof MessageCircle }[] = [
    { key: "chat", label: "Assistant", icon: MessageCircle },
    { key: "insights", label: "Suggestions", icon: Lightbulb },
    { key: "forecast", label: "Prévisions", icon: TrendingUp },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-pastel-sage rounded-2xl px-5 py-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-white/60 flex items-center justify-center shrink-0">
          <Sparkles size={20} className="text-ink" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-ink" style={{ fontFamily: "var(--font-heading)" }}>Assistant IA</h1>
          <p className="text-ink/60 text-sm mt-0.5">Posez des questions, recevez des suggestions et des prévisions basées sur vos données.</p>
        </div>
      </div>

      <div className="flex gap-1 bg-white border border-border rounded-full p-1 w-fit">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full font-medium transition-colors ${tab === t.key ? "bg-gold text-ink" : "text-tertiary hover:text-ink"}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "chat" && <ChatPanel />}
      {tab === "insights" && <InsightsPanel />}
      {tab === "forecast" && <ForecastPanel />}
    </div>
  );
}
