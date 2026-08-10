import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Network, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/siem/EmptyState";
import { SeverityBadge } from "@/components/siem/SeverityBadge";
import { useSecurityData } from "@/contexts/SecurityDataContext";
import { normalizeChain } from "@/lib/siem-types";

export default function IncidentsPage() {
  const { incidents: allIncidents, loading } = useSecurityData();
  const navigate = useNavigate();
  const incidents = allIncidents.filter((item) => item.status !== "resolved");

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="mb-6">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">Case management</p>
        <h1 className="text-2xl font-semibold tracking-[-0.04em]">Incidents</h1>
        <p className="mt-1 text-xs text-muted-foreground">Correlated attack chains with explainable summaries and response recommendations.</p>
      </div>

      {incidents.length ? (
        <div className="grid gap-3">
          {incidents.map((incident) => {
            const chain = normalizeChain(incident.chain);
            return (
              <article key={incident.id} className="dashboard-panel grid gap-4 md:grid-cols-[auto_1fr_auto] md:items-center">
                <span className="grid size-10 place-items-center rounded-lg border border-border bg-muted/30 text-muted-foreground">
                  <ShieldAlert className="size-4.5" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-sm font-semibold">{incident.summary || chain[0]?.label || "Security incident"}</h2>
                    <SeverityBadge severity={incident.severity} />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                    <span>User {incident.user_id || "unknown"}</span>
                    <span>{formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}</span>
                    <span className="inline-flex items-center gap-1"><Network className="size-3" /> {chain.length} chain steps</span>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 overflow-hidden">
                    {chain.slice(0, 5).map((step, index) => (
                      <div key={`${step.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
                        <span
                          className={`size-2 shrink-0 rounded-full ${
                            step.state === "compromised"
                              ? "bg-red-500"
                              : step.state === "suspicious"
                                ? "bg-amber-500"
                                : "bg-blue-500"
                          }`}
                        />
                        <span className="max-w-28 truncate text-[9px] text-muted-foreground">{step.label}</span>
                        {index < Math.min(chain.length, 5) - 1 && <ArrowRight className="size-3 shrink-0 text-border" />}
                      </div>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={() => navigate(`/incidents/${incident.id}`)} className="secondary-button">
                  View incident <ArrowRight className="size-3.5" />
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState title={loading ? "Loading incidents…" : "No incidents visible"} />
      )}
    </div>
  );
}