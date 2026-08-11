import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, CircleDot, Clock3, TriangleAlert } from "lucide-react";
import { EmptyState } from "@/components/siem/EmptyState";
import { SeverityBadge } from "@/components/siem/SeverityBadge";
import { useSecurityData } from "@/contexts/SecurityDataContext";
import { normalizeChain, toDate } from "@/lib/siem-types";

export default function TimelinePage() {
  const { incidents } = useSecurityData();
  const [selectedId, setSelectedId] = useState<string | null>(incidents[0]?.id ?? null);
  const selected = incidents.find((item) => item.id === selectedId) ?? incidents[0];
  const steps = useMemo(() => (selected ? normalizeChain(selected.chain) : []), [selected]);

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="mb-6">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">Sequence analysis</p>
        <h1 className="text-2xl font-semibold tracking-[-0.04em]">Attack Timeline</h1>
        <p className="mt-1 text-xs text-muted-foreground">Interactive event sequences parsed from the incidents.chain JSON field.</p>
      </div>

      {incidents.length ? (
        <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
          <aside className="dashboard-panel h-fit">
            <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Incident sequences</p>
            <div className="space-y-1.5">
              {incidents.map((incident) => (
                <button
                  type="button"
                  key={incident.id}
                  onClick={() => setSelectedId(incident.id)}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    selected?.id === incident.id
                      ? "border-lime-400/35 bg-lime-400/8"
                      : "border-transparent hover:border-border hover:bg-muted/25"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <SeverityBadge severity={incident.severity} />
                    <span className="text-[9px] text-muted-foreground">{format(toDate(incident.created_at), "MMM d")}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs font-medium">{incident.summary || "Security incident"}</p>
                  <p className="mt-1 text-[9px] text-muted-foreground">{normalizeChain(incident.chain).length} steps · {incident.user_id}</p>
                </button>
              ))}
            </div>
          </aside>

          <section className="dashboard-panel min-h-[520px]">
            <div className="mb-7 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Selected incident</p>
                <h2 className="mt-2 max-w-3xl text-lg font-semibold tracking-[-0.02em]">{selected?.summary || "Attack sequence"}</h2>
              </div>
              <div className="flex gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-blue-500" /> Normal</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-500" /> Suspicious</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-red-500" /> Compromise</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute bottom-5 left-[17px] top-5 w-px bg-border" />
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={`${step.label}-${index}`} className="relative grid grid-cols-[36px_1fr] gap-4">
                    <span
                      className={`z-10 grid size-9 place-items-center rounded-full border-4 border-card text-white ${
                        step.state === "compromised"
                          ? "bg-red-500"
                          : step.state === "suspicious"
                            ? "bg-amber-500"
                            : "bg-blue-500"
                      }`}
                    >
                      {step.state === "compromised" ? <TriangleAlert className="size-3.5" /> : step.state === "suspicious" ? <CircleDot className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
                    </span>
                    <div className="rounded-lg border border-border bg-muted/18 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Step {index + 1}</p>
                          <h3 className="mt-1 text-sm font-semibold">{step.label}</h3>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground">
                          <Clock3 className="size-3" />
                          {step.timestamp ? format(toDate(step.timestamp), "MMM d, HH:mm:ss") : `T+${index * 4}m`}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        {step.detail || (step.state === "compromised"
                          ? "Confirmed malicious behavior requiring immediate containment."
                          : step.state === "suspicious"
                            ? "Behavior deviated from the expected baseline and contributed to the correlated chain."
                            : "Initial observed activity within the incident sequence.")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      ) : (
        <EmptyState title="No attack chains visible" description="Incidents with chain JSON data will appear here." />
      )}
    </div>
  );
}