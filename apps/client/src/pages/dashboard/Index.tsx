import { Activity, CircleAlert, Gauge, ShieldAlert, Swords } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/siem/EmptyState";
import { KpiCard } from "@/components/siem/KpiCard";
import { Panel } from "@/components/siem/Panel";
import { SeverityBadge } from "@/components/siem/SeverityBadge";
import { useSecurityData } from "@/contexts/SecurityDataContext";
import {
  buildAttackTypes,
  buildDailyTrend,
  buildSeverityData,
  buildSparkline,
  calculateThreatScore,
} from "@/lib/analytics";
import { normalizeChain, normalizeSeverity, toDate } from "@/lib/siem-types";

const severityColors: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#3b82f6",
  info: "#06b6d4",
};

export default function DashboardPage() {
  const { alerts, incidents, loading, error, realtimeStatus, refresh } = useSecurityData();
  const navigate = useNavigate();
  const trend = buildDailyTrend(alerts, incidents);
  const attackTypes = buildAttackTypes(alerts, incidents);
  const severity = buildSeverityData(alerts, incidents);
  const criticalIncidents = incidents.filter((item) => normalizeSeverity(item.severity) === "critical").length;
  const activeAlerts = alerts.filter((item) => normalizeSeverity(item.severity) !== "low").length;
  const threatScore = calculateThreatScore(alerts, incidents);
  const threatSpark = buildSparkline([...alerts, ...incidents]);
  const incidentSpark = buildSparkline(incidents);
  const alertSpark = buildSparkline(alerts);
  const scoreSpark = trend.slice(-8).map((item) => Math.min(100, item.alerts * 9 + item.incidents * 17));

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span
              className={`size-1.5 rounded-full ${
                realtimeStatus === "connected" ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
              Security operations · {realtimeStatus}
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.04em]">Threat overview</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Live intelligence derived from your authenticated Supabase alerts and incidents.
          </p>
        </div>
        <button type="button" onClick={() => void refresh()} className="secondary-button">
          {loading ? "Refreshing…" : "Refresh data"}
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-500/25 bg-red-500/8 px-4 py-3 text-xs text-red-500">
          <strong className="font-semibold">Supabase query failed:</strong> {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Threats"
          value={alerts.length + incidents.length}
          subtext={alerts.length + incidents.length ? "Visible through current RLS session" : "— No prior data"}
          data={threatSpark}
          icon={<Activity className="size-4" />}
        />
        <KpiCard
          label="Critical Incidents"
          value={criticalIncidents}
          subtext={criticalIncidents ? `${Math.round((criticalIncidents / Math.max(1, incidents.length)) * 100)}% of incidents` : "— No critical incidents"}
          data={incidentSpark}
          icon={<ShieldAlert className="size-4" />}
        />
        <KpiCard
          label="Active Alerts"
          value={activeAlerts}
          subtext={alerts.length ? `${alerts.length - activeAlerts} low-priority events` : "— No active alerts"}
          data={alertSpark}
          icon={<CircleAlert className="size-4" />}
        />
        <KpiCard
          label="Total Events"
          value={alerts.length + incidents.length}
          subtext={`${alerts.length} alerts · ${incidents.length} incidents`}
          data={threatSpark}
          icon={<Activity className="size-4" />}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.65fr_1fr]">
        <Panel title="Threat Trend" eyebrow="LAST 14 DAYS" action={{ label: "Explore", onClick: () => navigate("/analytics") }}>
          {trend.some((item) => item.alerts || item.incidents) ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 3" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-fg)" }} />
                  <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 10, fill: "var(--muted-fg)" }} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 12 }} />
                  <Line type="monotone" dataKey="alerts" stroke="var(--accent-cyan)" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="incidents" stroke="#f97316" strokeWidth={1.8} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState />
          )}
        </Panel>

        <Panel title="Severity Distribution" eyebrow="CURRENT DATASET" action={{ label: "View All", onClick: () => navigate("/incidents") }}>
          {severity.length ? (
            <div className="grid items-center gap-4 sm:grid-cols-[1.05fr_.95fr] xl:grid-cols-1 2xl:grid-cols-[1.05fr_.95fr]">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={severity} dataKey="value" nameKey="name" innerRadius={53} outerRadius={76} paddingAngle={3} strokeWidth={0} isAnimationActive={false}>
                      {severity.map((item) => (
                        <Cell key={item.name} fill={severityColors[item.name] ?? "#64748b"} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {severity.map((item) => (
                  <div key={item.name} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-xs capitalize text-muted-foreground">
                      <span className="size-2 rounded-full" style={{ backgroundColor: severityColors[item.name] ?? "#64748b" }} />
                      {item.name}
                    </span>
                    <strong className="text-xs tabular-nums">{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState />
          )}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1.35fr]">
        <Panel title="Attack Types" eyebrow="TOP VECTORS" action={{ label: "Explore", onClick: () => navigate("/analytics") }}>
          {attackTypes.length ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attackTypes} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid horizontal={false} stroke="var(--chart-grid)" strokeDasharray="3 3" />
                  <XAxis type="number" axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 10, fill: "var(--muted-fg)" }} />
                  <YAxis type="category" dataKey="name" width={105} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-fg)" }} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="value" fill="var(--accent-cyan)" radius={[0, 4, 4, 0]} barSize={12} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState />
          )}
        </Panel>

        <Panel title="Incident Feed" eyebrow="LIVE" action={{ label: "View All", onClick: () => navigate("/incidents") }}>
          {incidents.length ? (
            <div className="divide-y divide-border">
              {incidents.slice(0, 6).map((incident) => {
                const chain = normalizeChain(incident.chain);
                return (
                  <button
                    type="button"
                    key={incident.id}
                    onClick={() => navigate(`/incidents/${incident.id}`)}
                    className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 py-3 text-left transition first:pt-0 last:pb-0 hover:bg-muted/25"
                  >
                    <span className="grid size-8 place-items-center rounded-md border border-border bg-muted/35 text-muted-foreground">
                      <Swords className="size-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-xs font-medium">{chain[0]?.label || "Security incident"}</span>
                        <SeverityBadge severity={incident.severity} />
                      </span>
                      <span className="mt-1 block truncate text-[10px] text-muted-foreground">
                        User {incident.user_id || "unknown"} · {incident.summary || "No summary available"}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block text-[10px] text-muted-foreground">
                        {formatDistanceToNow(toDate(incident.created_at), { addSuffix: true })}
                      </span>
                      <span className="mt-1 block text-[9px] font-medium uppercase tracking-[0.08em] text-lime-500">
                        {normalizeSeverity(incident.severity) === "critical" ? "Open" : "Monitoring"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No incidents visible" />
          )}
        </Panel>
      </div>
    </div>
  );
}