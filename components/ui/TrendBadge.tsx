import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function TrendBadge({ value, suffix = "%", showIcon = true }: { value: number; suffix?: string; showIcon?: boolean }) {
  const positive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full tabular-nums ${
        positive ? "bg-badge-pos-bg text-badge-pos-text" : "bg-badge-neg-bg text-badge-neg-text"
      }`}
    >
      {showIcon && (positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />)}
      {positive ? "+" : ""}
      {value}
      {suffix}
    </span>
  );
}
