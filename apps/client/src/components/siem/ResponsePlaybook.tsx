import { CheckCircle2, Loader2, Search, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { splitRecommendations } from "@/lib/siem-types";
import { useSecurityData } from "@/contexts/SecurityDataContext";

const defaults = [
  "Reset user credentials",
  "Block malicious IP",
  "Quarantine affected device",
  "Scan endpoints",
  "Notify administrator",
];

export function ResponsePlaybook({
  recommendation,
  targetType,
  targetId,
}: {
  recommendation?: string | null;
  targetType: "alert" | "incident";
  targetId: string;
}) {
  const { logResponseAction, updateStatus } = useSecurityData();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const actions = splitRecommendations(recommendation);
  const recommendations = actions.length ? actions : defaults;

  const handleResolve = async () => {
    setBusy("resolve");
    await logResponseAction("Mark Resolved", targetType, targetId);
    await updateStatus(targetType, targetId, "resolved");
    setBusy(null);
    navigate(targetType === "alert" ? "/alerts" : "/incidents");
  };

  const handleEscalate = async () => {
    setBusy("escalate");
    await logResponseAction("Escalate", targetType, targetId);
    await updateStatus(targetType, targetId, "escalated");
    setBusy(null);
  };

  const handleInvestigate = async () => {
    setBusy("investigate");
    await logResponseAction("Investigate", targetType, targetId);
    await updateStatus(targetType, targetId, "investigating");
    setBusy(null);
  };

  return (
    <div>
      <div className="space-y-2.5">
        {recommendations.map((action, index) => (
          <div key={`${action}-${index}`} className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-3">
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-lime-400/10 text-lime-500">
              <CheckCircle2 className="size-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium">{action}</p>
              <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">
                Recommended control from the incident response guidance.
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <button type="button" onClick={() => void handleResolve()} disabled={busy !== null} className="primary-button">
          {busy === "resolve" ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
          Mark Resolved
        </button>
        <button type="button" onClick={() => void handleEscalate()} disabled={busy !== null} className="danger-button">
          {busy === "escalate" ? <Loader2 className="size-3.5 animate-spin" /> : <ShieldAlert className="size-3.5" />}
          Escalate
        </button>
        <button type="button" onClick={() => void handleInvestigate()} disabled={busy !== null} className="secondary-button">
          {busy === "investigate" ? <Loader2 className="size-3.5 animate-spin" /> : <Search className="size-3.5" />}
          Investigate
        </button>
      </div>
    </div>
  );
}