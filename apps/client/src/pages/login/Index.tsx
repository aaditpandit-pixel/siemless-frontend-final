import { useEffect, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, Moon, ShieldCheck, Sun } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Brand } from "@/components/siem/Brand";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    if (!loading && user) {
      const state = location.state as { from?: string } | null;
      navigate(state?.from || "/", { replace: true });
    }
  }, [loading, location.state, navigate, user]);

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage({ type: "error", text: error.message });
    setSubmitting(false);
  };

  const resetPassword = async () => {
    if (!email.trim()) {
      setMessage({ type: "error", text: "Enter your email address first." });
      return;
    }
    setResetting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setMessage(
      error
        ? { type: "error", text: error.message }
        : { type: "success", text: "Password reset instructions were sent if the account exists." },
    );
    setResetting(false);
  };

  return (
    <div className="relative grid min-h-screen bg-background lg:grid-cols-[1.05fr_.95fr]">
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute right-5 top-5 z-10 grid size-9 place-items-center rounded-md border border-border bg-card text-muted-foreground transition hover:text-foreground"
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>

      <section className="hidden overflow-hidden border-r border-border bg-sidebar p-12 lg:flex lg:flex-col lg:justify-between">
        <Brand />
        <div className="max-w-xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-600 dark:text-cyan-400">
            <span className="size-1.5 rounded-full bg-cyan-500" />
            AI-powered security operations
          </div>
          <h1 className="max-w-lg text-5xl font-semibold leading-[1.06] tracking-[-0.055em]">
            See the attack chain before it becomes a breach.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-muted-foreground">
            SIEMless turns security telemetry into clear incident narratives, prioritized risks, and practical response actions for fast-moving fintech teams.
          </p>
          <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
            {[
              ["Realtime", "Alert monitoring"],
              ["Explainable", "Incident summaries"],
              ["Focused", "Response guidance"],
            ].map(([title, detail]) => (
              <div key={title} className="rounded-lg border border-border bg-card/60 p-4">
                <p className="text-xs font-semibold">{title}</p>
                <p className="mt-1 text-[10px] leading-4 text-muted-foreground">{detail}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">Protected by your existing Supabase Auth and Row Level Security policies.</p>
      </section>

      <section className="flex min-h-screen items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Brand />
          </div>
          <div className="mb-8">
            <span className="mb-5 grid size-11 place-items-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-500">
              <ShieldCheck className="size-5" />
            </span>
            <h2 className="text-2xl font-semibold tracking-[-0.035em]">Sign in to SIEMless</h2>
            <p className="mt-2 text-sm text-muted-foreground">Access your security operations workspace.</p>
          </div>

          <form onSubmit={signIn} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium">Email address</span>
              <span className="relative block">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  placeholder="security@company.com"
                  className="h-11 w-full rounded-md border border-border bg-card pl-10 pr-3 text-sm outline-none transition focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium">Password</span>
              <span className="relative block">
                <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="h-11 w-full rounded-md border border-border bg-card pl-10 pr-11 text-sm outline-none transition focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </span>
            </label>

            {message && (
              <div
                className={`rounded-md border px-3 py-2.5 text-xs leading-5 ${
                  message.type === "error"
                    ? "border-red-500/25 bg-red-500/8 text-red-500"
                    : "border-emerald-500/25 bg-emerald-500/8 text-emerald-500"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-md bg-cyan-500 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <button
            type="button"
            disabled={resetting}
            onClick={() => void resetPassword()}
            className="mt-5 w-full text-center text-xs font-medium text-cyan-600 hover:text-cyan-500 disabled:opacity-60 dark:text-cyan-400"
          >
            {resetting ? "Sending reset email..." : "Forgot Password?"}
          </button>

          <div className="mt-9 border-t border-border pt-5 text-center text-[10px] leading-4 text-muted-foreground">
            Use an account configured in the connected Supabase project.
          </div>
        </div>
      </section>
    </div>
  );
}
