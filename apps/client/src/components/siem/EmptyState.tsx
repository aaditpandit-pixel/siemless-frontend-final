import { DatabaseZap } from "lucide-react";

export function EmptyState({
  title = "No data yet",
  description = "New authenticated events will appear here as Supabase rows become visible through RLS.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="grid min-h-44 place-items-center rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
      <div>
        <span className="mx-auto mb-3 grid size-9 place-items-center rounded-lg border border-border bg-background text-muted-foreground">
          <DatabaseZap className="size-4" />
        </span>
        <p className="text-sm font-medium">{title}</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
