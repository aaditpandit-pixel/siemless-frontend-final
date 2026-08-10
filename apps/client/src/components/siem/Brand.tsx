import { ShieldCheck } from "lucide-react";
export function Brand({
  compact = false
}: {
  compact?: boolean;
}) {
  return <div className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-500">
        <ShieldCheck className="lucide lucide-shield-check size-4.5 bg-[rgb(13,0,128)]" strokeWidth={2.2} />
      </span>
      {!compact && <span className="text-[15px] font-semibold tracking-[-0.02em] text-foreground">
          SIEM<span className="text-cyan-500">less</span>
        </span>}
    </div>;
}