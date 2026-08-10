import { Bell, Moon, Save, UsersRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [realtimeUpdates, setRealtimeUpdates] = useState(true);

  const save = () => {
    toast.success("Preferences saved locally", {
      description: "Profile and notification backend fields are not part of the supplied Supabase schema.",
    });
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">Workspace administration</p>
        <h1 className="text-2xl font-semibold tracking-[-0.04em]">Settings</h1>
        <p className="mt-1 text-xs text-muted-foreground">Manage your local dashboard preferences and authenticated account context.</p>
      </div>

      <div className="grid gap-4">
        <section className="dashboard-panel">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg border border-border bg-muted/25 text-muted-foreground">
              <UsersRound className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">Profile</h2>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Identity supplied by Supabase Auth</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-1.5 block text-xs font-medium">Email</span>
              <input disabled value={user?.email ?? ""} className="h-10 w-full rounded-md border border-border bg-muted/25 px-3 text-xs text-muted-foreground" />
            </label>
            <label>
              <span className="mb-1.5 block text-xs font-medium">User ID</span>
              <input disabled value={user?.id ?? ""} className="h-10 w-full rounded-md border border-border bg-muted/25 px-3 text-xs text-muted-foreground" />
            </label>
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg border border-border bg-muted/25 text-muted-foreground">
              <Bell className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">Notification preferences</h2>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Local UI preferences for this device</p>
            </div>
          </div>
          <div className="divide-y divide-border">
            {[
              ["Critical incident notifications", "Surface critical cases immediately in the dashboard.", criticalAlerts, setCriticalAlerts],
              ["Weekly security digest", "Prepare a concise weekly posture summary.", weeklyDigest, setWeeklyDigest],
              ["Realtime feed updates", "Show incoming alerts and incidents without a page refresh.", realtimeUpdates, setRealtimeUpdates],
            ].map(([label, description, checked, setter]) => (
              <label key={String(label)} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <span>
                  <span className="block text-xs font-medium">{String(label)}</span>
                  <span className="mt-1 block text-[10px] text-muted-foreground">{String(description)}</span>
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(checked)}
                  onChange={(event) => (setter as React.Dispatch<React.SetStateAction<boolean>>)(event.target.checked)}
                  className="size-4 accent-cyan-500"
                />
              </label>
            ))}
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-lg border border-border bg-muted/25 text-muted-foreground">
                <Moon className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold">Appearance</h2>
                <p className="mt-0.5 text-[10px] text-muted-foreground">Current theme: <span className="capitalize">{theme}</span></p>
              </div>
            </div>
            <button type="button" onClick={toggleTheme} className="secondary-button">Switch to {theme === "dark" ? "light" : "dark"} mode</button>
          </div>
        </section>

        <section className="dashboard-panel border-dashed">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg border border-border bg-muted/25 text-muted-foreground">
              <UsersRound className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">Team</h2>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Team management placeholder — no team table was added, as requested.</p>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button type="button" onClick={save} className="primary-button"><Save className="size-3.5" /> Save preferences</button>
        </div>
      </div>
    </div>
  );
}
