import { CheckCircle2, Search, ShieldAlert } from "lucide-react";
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
  const actions = splitRecommendations(recommendation);
  const recommendations = actions.length ? actions : defaults;

  const handleResolve = () => {
    void logResponseAction("Mark Resolved", targetType, targetId);
    void updateStatus(targetType, targetId, "resolved");
  };

  return (
    <div>
      <div className="space-y-2.5">
        {recommendations.map((action, index) => (
          <div key={`${action}-${index}`} className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-3">
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-cyan-500/10 text-cyan-500">
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
        <button type="button" onClick={handleResolve} className="primary-button">
          <CheckCircle2 className="size-3.5" />
          Mark Resolved
        </button>
        <button type="button" onClick={() => void logResponseAction("Escalate", targetType, targetId)} className="danger-button">
          <ShieldAlert className="size-3.5" />
          Escalate
        </button>
        <button type="button" onClick={() => void logResponseAction("Investigate", targetType, targetId)} className="secondary-button">
          <Search className="size-3.5" />
          Investigate
        </button>
      </div>
    </div>
  );
}