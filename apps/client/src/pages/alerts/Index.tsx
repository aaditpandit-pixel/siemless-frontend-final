import { useMemo, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowUpRight, CircleAlert, Filter, Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EmptyState } from "@/components/siem/EmptyState";
import { SeverityBadge } from "@/components/siem/SeverityBadge";
import { useSecurityData } from "@/contexts/SecurityDataContext";
import { normalizeSeverity, toDate } from "@/lib/siem-types";

export default function AlertsPage() {
  const { alerts, loading } = useSecurityData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [severity, setSeverity] = useState("all");

  const filtered = useMemo(
    () =>
      alerts.filter((alert) => {
        const matchesQuery =
          !query ||
          `${alert.event_type} ${alert.user_id} ${alert.summary}`.toLowerCase().includes(query.toLowerCase());
        return matchesQuery && (severity === "all" || normalizeSeverity(alert.severity) === severity);
      }),
    [alerts, query, severity],
  );

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="mb-6">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">Detection queue</p>
        <h1 className="text-2xl font-semibold tracking-[-0.04em]">Alerts</h1>
        <p className="mt-1 text-xs text-muted-foreground">Review authenticated alert records and open the incident context behind each signal.</p>
      </div>

      <section className="dashboard-panel overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search event, user, or summary"
              className="h-9 w-full rounded-md border border-border bg-muted/25 pl-9 pr-3 text-xs outline-none focus:border-lime-400/60"
            />
          </label>
          <label className="relative">
            <Filter className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <select
              value={severity}
              onChange={(event) => setSeverity(event.target.value)}
              className="h-9 rounded-md border border-border bg-card pl-9 pr-8 text-xs outline-none focus:border-lime-400/60"
            >
              <option value="all">All severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
        </div>

        {filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Event</th>
                  <th className="px-4 py-3 font-semibold">Severity</th>
                  <th className="px-4 py-3 font-semibold">Affected user</th>
                  <th className="px-4 py-3 font-semibold">Score</th>
                  <th className="px-4 py-3 font-semibold">Detected</th>
                  <th className="px-4 py-3 text-right font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((alert) => (
                  <tr key={alert.id} className="group transition-colors hover:bg-muted/25">
                    <td className="max-w-md px-4 py-3.5">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md border border-border bg-muted/30 text-muted-foreground">
                          <CircleAlert className="size-3.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium">{alert.event_type || "Security alert"}</p>
                          <p className="mt-1 line-clamp-1 text-[10px] text-muted-foreground">{alert.summary || "No summary available"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><SeverityBadge severity={alert.severity} /></td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{alert.user_id || "unknown"}</td>
                    <td className="px-4 py-3.5 text-xs font-semibold tabular-nums">{Math.round(Number(alert.score ?? 0) * 100)}</td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs">{formatDistanceToNow(toDate(alert.created_at), { addSuffix: true })}</p>
                      <p className="mt-0.5 text-[9px] text-muted-foreground">{format(toDate(alert.created_at), "MMM d, HH:mm")}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/alerts/${alert.id}`)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-lime-500"
                      >
                        Open <ArrowUpRight className="size-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              title={loading ? "Loading alerts…" : "No matching alerts"}
              description={query || severity !== "all" ? "Adjust the search or severity filter." : undefined}
            />
          </div>
        )}
      </section>
    </div>
  );
}