import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function RequireSupabaseAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="text-center">
          <span className="mx-auto grid size-10 place-items-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-500">
            <ShieldCheck className="size-5 animate-pulse" />
          </span>
          <p className="mt-3 text-xs text-muted-foreground">Restoring secure session…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
