import { FileChartColumn, ShieldCheck, TriangleAlert, UsersRound } from "lucide-react";
import { format } from "date-fns";
import { Panel } from "@/components/siem/Panel";
import { EmptyState } from "@/components/siem/EmptyState";
import { SeverityBadge } from "@/components/siem/SeverityBadge";
import { useSecurityData } from "@/contexts/SecurityDataContext";
import { buildAttackTypes, buildUserRisk, calculateThreatScore } from "@/lib/analytics";
import { normalizeSeverity } from "@/lib/siem-types";

export default function ReportsPage() {
  const { alerts, incidents } = useSecurityData();
  const categories = buildAttackTypes(alerts, incidents);
  const users = buildUserRisk(alerts, incidents);
  const critical = incidents.filter((item) => normalizeSeverity(item.severity) === "critical").length;
  const threatScore = calculateThreatScore(alerts, incidents);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">Executive visibility</p>
          <h1 className="text-2xl font-semibold tracking-[-0.04em]">Security Reports</h1>
          <p className="mt-1 text-xs text-muted-foreground">A concise operational summary for {format(new Date(), "MMMM yyyy")}.</p>
        </div>
        <button type="button" onClick={() => window.print()} className="primary-button">
          <FileChartColumn className="size-3.5" /> Print report
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Threat posture", value: `${threatScore}/100`, icon: ShieldCheck, detail: threatScore >= 70 ? "High attention required" : "Actively monitored" },
          { label: "Critical incidents", value: critical, icon: TriangleAlert, detail: `${incidents.length} total incidents` },
          { label: "Affected users", value: users.length, icon: UsersRound, detail: `${alerts.length} alert records` },
        ].map((item) => (
          <div key={item.label} className="dashboard-panel">
            <item.icon className="size-4 text-cyan-500" />
            <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] tabular-nums">{item.value}</p>
            <p className="mt-2 text-[10px] text-muted-foreground">{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Top Attack Categories" eyebrow="CURRENT PERIOD">
          {categories.length ? (
            <div className="space-y-2">
              {categories.map((item, index) => (
                <div key={item.name} className="flex items-center gap-3 rounded-lg border border-border bg-muted/18 p-3">
                  <span className="grid size-7 place-items-center rounded-md bg-card text-[10px] font-semibold">{index + 1}</span>
                  <p className="min-w-0 flex-1 truncate text-xs font-medium">{item.name}</p>
                  <strong className="text-xs tabular-nums">{item.value}</strong>
                </div>
              ))}
            </div>
          ) : <EmptyState />}
        </Panel>

        <Panel title="Recent Critical Incidents" eyebrow="REQUIRES REVIEW">
          {incidents.length ? (
            <div className="space-y-2">
              {incidents.slice(0, 6).map((item) => (
                <div key={item.id} className="rounded-lg border border-border bg-muted/18 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <SeverityBadge severity={item.severity} />
                    <span className="text-[9px] text-muted-foreground">{format(new Date(item.created_at), "MMM d, HH:mm")}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs font-medium">{item.summary || "Security incident"}</p>
                  <p className="mt-1 text-[9px] text-muted-foreground">Affected user: {item.user_id}</p>
                </div>
              ))}
            </div>
          ) : <EmptyState />}
        </Panel>
      </div>
    </div>
  );
}
