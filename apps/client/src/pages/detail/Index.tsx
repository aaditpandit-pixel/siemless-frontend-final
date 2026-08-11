import { ArrowLeft, BrainCircuit, Clock3, Network, UserRound } from "lucide-react";
import { format } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import { Panel } from "@/components/siem/Panel";
import { ResponsePlaybook } from "@/components/siem/ResponsePlaybook";
import { SeverityBadge } from "@/components/siem/SeverityBadge";
import { useSecurityData } from "@/contexts/SecurityDataContext";
import { normalizeChain, severityWeight, toDate } from "@/lib/siem-types";

export default function DetailPage({ type }: { type: "alert" | "incident" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { alerts, incidents } = useSecurityData();
  const alert = type === "alert" ? alerts.find((item) => item.id === id) : undefined;
  const incident = type === "incident" ? incidents.find((item) => item.id === id) : undefined;
  const record = alert ?? incident;
  const chain = incident
    ? normalizeChain(incident.chain)
    : alert
      ? normalizeChain([alert.event_type, alert.summary])
      : [];

  if (!record) {
    return (
      <div className="mx-auto max-w-3xl">
        <button type="button" onClick={() => navigate(-1)} className="secondary-button mb-5">
          <ArrowLeft className="size-3.5" /> Back
        </button>
        <div className="dashboard-panel text-center">
          <p className="text-sm font-medium">Record not found or not visible through the current RLS session.</p>
        </div>
      </div>
    );
  }

  const rootCause = chain[0]?.label || (alert ? alert.event_type : "Unclassified activity");
  const risk = severityWeight(record.severity);

  return (
    <div className="mx-auto max-w-6xl">
      <button type="button" onClick={() => navigate(-1)} className="secondary-button mb-5">
        <ArrowLeft className="size-3.5" /> Back
      </button>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <SeverityBadge severity={record.severity} />
            <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{type} detail</span>
          </div>
          <h1 className="max-w-3xl text-2xl font-semibold tracking-[-0.04em]">
            {record.summary || (alert ? alert.event_type : "Security incident")}
          </h1>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><UserRound className="size-3" /> {record.user_id || "unknown"}</span>
            <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3" /> {format(toDate(record.created_at), "MMM d, yyyy · HH:mm:ss")}</span>
            <span className="inline-flex items-center gap-1.5"><Network className="size-3" /> {chain.length} attack chain steps</span>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3 text-right">
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Risk level</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{risk}<span className="text-xs text-muted-foreground">/100</span></p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <Panel title="AI Incident Summary" eyebrow="PLAIN-ENGLISH EXPLANATION">
          <div className="rounded-lg border border-lime-400/20 bg-lime-400/6 p-4">
            <div className="flex items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-lime-400/12 text-lime-500">
                <BrainCircuit className="size-4" />
              </span>
              <p className="text-sm leading-6">{record.summary || "No summary has been recorded for this security event."}</p>
            </div>
          </div>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <dt className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Root cause</dt>
              <dd className="mt-2 text-xs font-medium">{rootCause}</dd>
            </div>
            <div className="rounded-lg border border-border p-4">
              <dt className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Risk classification</dt>
              <dd className="mt-2 text-xs font-medium capitalize">{record.severity || "Unknown"} · score {risk}</dd>
            </div>
          </dl>
          <div className="mt-5">
            <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Attack chain</p>
            <div className="space-y-2">
              {chain.map((step, index) => (
                <div key={`${step.label}-${index}`} className="flex items-center gap-3 rounded-md border border-border bg-muted/20 px-3 py-2.5">
                  <span
                    className={`grid size-6 shrink-0 place-items-center rounded-full text-[9px] font-semibold text-white ${
                      step.state === "compromised"
                        ? "bg-red-500"
                        : step.state === "suspicious"
                          ? "bg-amber-500"
                          : "bg-blue-500"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{step.label}</p>
                    {step.detail && <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{step.detail}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="AI Response Playbook" eyebrow="RECOMMENDED ACTIONS">
          <ResponsePlaybook recommendation={record.recommendation} targetType={type} targetId={record.id} />
        </Panel>
      </div>
    </div>
  );
}