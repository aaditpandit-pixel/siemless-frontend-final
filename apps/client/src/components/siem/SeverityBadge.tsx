import { normalizeSeverity } from "@/lib/siem-types";

const severityClasses: Record<string, string> = {
  critical: "border-red-500/25 bg-red-500/10 text-red-500",
  high: "border-orange-500/25 bg-orange-500/10 text-orange-500",
  medium: "border-amber-500/25 bg-amber-500/10 text-amber-500",
  low: "border-blue-500/25 bg-blue-500/10 text-blue-500",
  info: "border-cyan-500/25 bg-cyan-500/10 text-cyan-500",
};

export function SeverityBadge({ severity }: { severity?: string | null }) {
  const normalized = normalizeSeverity(severity);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${
        severityClasses[normalized] ?? "border-border bg-muted text-muted-foreground"
      }`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {normalized}
    </span>
  );
}
