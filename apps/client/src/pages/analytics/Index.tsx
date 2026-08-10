import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Crosshair, Gauge, UsersRound } from "lucide-react";
import { EmptyState } from "@/components/siem/EmptyState";
import { KpiCard } from "@/components/siem/KpiCard";
import { Panel } from "@/components/siem/Panel";
import { useSecurityData } from "@/contexts/SecurityDataContext";
import {
  buildAttackTypes,
  buildDailyTrend,
  buildSparkline,
  buildUserRisk,
  calculateThreatScore,
} from "@/lib/analytics";

export default function AnalyticsPage() {
  const { alerts, incidents } = useSecurityData();
  const trend = buildDailyTrend(alerts, incidents, 21);
  const categories = buildAttackTypes(alerts, incidents);
  const userRisk = buildUserRisk(alerts, incidents);
  const scores = alerts.map((item) => Number(item.score ?? 0)).filter(Number.isFinite);
  const accuracy = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  const threatScore = calculateThreatScore(alerts, incidents);
  const affectedUsers = new Set([...alerts, ...incidents].map((item) => item.user_id).filter(Boolean)).size;
  const scoreData = useMemo(
    () =>
      trend.map((item) => ({
        date: item.date,
        score: Math.min(100, Math.round(item.alerts * 8 + item.incidents * 18)),
      })),
    [trend],
  );

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="mb-6">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">Threat intelligence</p>
        <h1 className="text-2xl font-semibold tracking-[-0.04em]">Threat Analytics</h1>
        <p className="mt-1 text-xs text-muted-foreground">Risk patterns and detection performance calculated from the current Supabase dataset.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Threat Score" value={`${threatScore}/100`} subtext="Severity-weighted event average" data={scoreData.slice(-8).map((item) => item.score)} icon={<Gauge className="size-4" />} />
        <KpiCard label="Detection Accuracy" value={`${accuracy}%`} subtext="Average alert score recorded" data={buildSparkline(alerts)} icon={<Crosshair className="size-4" />} />
        <KpiCard label="Affected Users" value={affectedUsers} subtext="Unique users in visible events" data={userRisk.slice(0, 8).map((item) => item.events)} icon={<UsersRound className="size-4" />} />
        <KpiCard label="Event Volume" value={alerts.length + incidents.length} subtext="Alerts and correlated incidents" data={buildSparkline([...alerts, ...incidents])} icon={<Activity className="size-4" />} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Threat Score Trend" eyebrow="21-DAY RISK PROFILE">
          {scoreData.some((item) => item.score > 0) ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreData}>
                  <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 3" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-fg)" }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-fg)" }} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }} />
                  <Line dataKey="score" type="monotone" stroke="var(--accent-cyan)" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState />
          )}
        </Panel>

        <Panel title="Attack Categories" eyebrow="RANKED BY VOLUME">
          {categories.length ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories}>
                  <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 3" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} interval={0} angle={-20} height={56} tick={{ fontSize: 9, fill: "var(--muted-fg)" }} />
                  <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 10, fill: "var(--muted-fg)" }} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                    {categories.map((item, index) => (
                      <Cell key={item.name} fill={index === 0 ? "var(--accent-cyan)" : "var(--chart-muted)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState />
          )}
        </Panel>
      </div>

      <Panel title="User Risk Score" eyebrow="HIGHEST EXPOSURE" className="mt-4">
        {userRisk.length ? (
          <div className="grid gap-2 lg:grid-cols-2">
            {userRisk.map((item, index) => (
              <div key={item.user} className="flex items-center gap-3 rounded-lg border border-border bg-muted/18 p-3">
                <span className="grid size-8 place-items-center rounded-md border border-border bg-card text-[10px] font-semibold tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-xs font-medium">{item.user}</p>
                    <strong className="text-xs tabular-nums">{item.score}/100</strong>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${item.score >= 75 ? "bg-red-500" : item.score >= 50 ? "bg-amber-500" : "bg-cyan-500"}`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-[9px] text-muted-foreground">{item.events} events · {item.critical} critical</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </Panel>
    </div>
  );
}
