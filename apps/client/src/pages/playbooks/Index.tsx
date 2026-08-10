import { BookOpenCheck, ChevronRight } from "lucide-react";
import { ResponsePlaybook } from "@/components/siem/ResponsePlaybook";
import { SeverityBadge } from "@/components/siem/SeverityBadge";
import { EmptyState } from "@/components/siem/EmptyState";
import { useSecurityData } from "@/contexts/SecurityDataContext";

export default function PlaybooksPage() {
  const { incidents, alerts } = useSecurityData();
  const records = [
    ...incidents.map((item) => ({ ...item, type: "incident" as const, title: item.summary || "Incident response" })),
    ...alerts.map((item) => ({ ...item, type: "alert" as const, title: item.event_type || item.summary || "Alert response" })),
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">Security operations</p>
        <h1 className="text-2xl font-semibold tracking-[-0.04em]">Response Playbooks</h1>
        <p className="mt-1 text-xs text-muted-foreground">Prioritized actions generated from the recommendation field on alerts and incidents.</p>
      </div>

      {records.length ? (
        <div className="grid gap-4">
          {records.slice(0, 12).map((record) => (
            <details key={`${record.type}-${record.id}`} className="dashboard-panel group">
              <summary className="flex cursor-pointer list-none items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg border border-border bg-muted/25 text-muted-foreground">
                  <BookOpenCheck className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-sm font-semibold">{record.title}</h2>
                    <SeverityBadge severity={record.severity} />
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground capitalize">{record.type} · user {record.user_id}</p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground transition-transform group-open:rotate-90" />
              </summary>
              <div className="mt-5 border-t border-border pt-5">
                <ResponsePlaybook recommendation={record.recommendation} targetType={record.type} targetId={record.id} />
              </div>
            </details>
          ))}
        </div>
      ) : (
        <EmptyState title="No response recommendations visible" />
      )}
    </div>
  );
}
