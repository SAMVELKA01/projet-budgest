"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, TrendingUp, Lightbulb, MessageCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";
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

const severityConfig = {
  info: { icon: Info, color: "text-secondary", bg: "bg-secondary/10" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  success: { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
};

async function fetchJsonOrThrow(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Erreur du service IA");
  return data;
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
    "Combien ai-je dépensé ce mois-ci ?",
    "Quelle est ma plus grosse catégorie de dépense ?",
    "Suis-je dans mes budgets ce mois-ci ?",
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
    <div className="bg-white border border-border rounded-2xl flex flex-col h-[520px]">
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
              <Sparkles size={22} className="text-secondary" />
            </div>
            <p className="text-sm text-tertiary max-w-xs">
              Posez une question sur vos finances en langage naturel. Je réponds uniquement à partir de vos données.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-xs font-medium text-primary bg-neutral border border-border rounded-xl px-3 py-2.5 hover:border-secondary transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === "user" ? "bg-primary text-white" : "bg-neutral text-primary"
              }`}
            >
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
          className="flex-1 bg-neutral border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-secondary transition-colors"
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-light transition-colors disabled:opacity-40 shrink-0"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
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
        <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
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
          <div key={i} className="bg-white border border-border rounded-2xl p-5 flex gap-3">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={16} className={color} />
            </div>
            <div>
              <p className="text-sm font-bold text-primary">{insight.title}</p>
              <p className="text-xs text-tertiary mt-1 leading-relaxed">{insight.message}</p>
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
        <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
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
          <TrendingUp size={18} className="text-secondary" />
          <h3 className="font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
            Historique &amp; prévisions
          </h3>
        </div>
        <div className="flex items-end gap-2" style={{ height: "160px" }}>
          {allMonths.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="flex items-end gap-0.5 w-full" style={{ height: "130px" }}>
                <div
                  className="flex-1 rounded-t-md"
                  style={{
                    height: `${(m.revenus / max) * 130}px`,
                    background: m.projected ? "#22C55E80" : "#22C55E",
                    minHeight: m.revenus > 0 ? "3px" : "0",
                  }}
                />
                <div
                  className="flex-1 rounded-t-md"
                  style={{
                    height: `${(m.depenses / max) * 130}px`,
                    background: m.projected ? "#EF444480" : "#EF4444",
                    minHeight: m.depenses > 0 ? "3px" : "0",
                  }}
                />
              </div>
              <span className={`text-[10px] ${m.projected ? "text-tertiary italic" : "text-tertiary"}`}>{m.month}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs text-tertiary mt-4">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success inline-block" /> Revenus</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-danger inline-block" /> Dépenses</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-tertiary/40 inline-block" /> Projection (mois futurs)</span>
        </div>
      </div>

      <div className="bg-white border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={18} className="text-secondary" />
          <h3 className="font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>Analyse</h3>
        </div>
        <p className="text-sm text-tertiary leading-relaxed">{data.narrative}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {data.projected.map((p, i) => (
          <div key={i} className="bg-white border border-border rounded-2xl p-5">
            <p className="text-xs font-semibold text-tertiary uppercase tracking-wide mb-2">{p.month}</p>
            <p className="text-sm text-success font-bold">+{format(p.projectedRevenus)}</p>
            <p className="text-sm text-danger font-bold">-{format(p.projectedDepenses)}</p>
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
      <div>
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
          <Sparkles size={22} className="text-secondary" /> Assistant IA
        </h1>
        <p className="text-tertiary text-sm mt-1">Posez des questions, recevez des suggestions et des prévisions basées sur vos données.</p>
      </div>

      <div className="flex gap-2 bg-white border border-border rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
              tab === t.key ? "bg-primary text-white" : "text-tertiary hover:text-primary"
            }`}
          >
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
