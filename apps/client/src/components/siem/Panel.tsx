import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

export function Panel({
  title,
  eyebrow,
  action,
  children,
  className = "",
}: {
  title: string;
  eyebrow?: string;
  action?: { label: string; onClick?: () => void };
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`dashboard-panel ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          {eyebrow && <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{eyebrow}</p>}
          <h2 className="text-sm font-semibold tracking-[-0.01em]">{title}</h2>
        </div>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="inline-flex items-center gap-0.5 text-xs font-medium text-cyan-500 transition-colors hover:text-cyan-400"
          >
            {action.label}
            <ChevronRight className="size-3.5" />
          </button>
        )}
      </div>
      {children}
    </section>
  );
}
