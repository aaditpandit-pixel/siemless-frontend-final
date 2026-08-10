import type { ReactNode } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

export function KpiCard({
  label,
  value,
  subtext,
  data,
  icon,
}: {
  label: string;
  value: string | number;
  subtext: string;
  data: number[];
  icon: ReactNode;
}) {
  const chartData = data.map((point, index) => ({ index, value: point }));
  const gradientId = `kpi-${label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

  return (
    <article className="dashboard-panel min-w-0 p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <strong className="text-3xl font-semibold tracking-[-0.04em] tabular-nums">{value}</strong>
        <div className="h-10 w-24">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--accent-cyan)"
                fill={`url(#${gradientId})`}
                strokeWidth={1.8}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">{subtext}</p>
    </article>
  );
}
