import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bell,
  BookOpenCheck,
  ChartNoAxesCombined,
  ChevronDown,
  CircleAlert,
  Command,
  FileChartColumn,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Radio,
  Search,
  Settings,
  ShieldAlert,
  Sun,
  Timeline,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Brand } from "./Brand";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSecurityData } from "@/contexts/SecurityDataContext";

const navigation = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard", to: "/", icon: LayoutDashboard },
      { label: "Alerts", to: "/alerts", icon: CircleAlert },
      { label: "Incidents", to: "/incidents", icon: ShieldAlert },
      { label: "Live Simulator", to: "/simulator", icon: Radio },
    ],
  },
  {
    label: "INTELLIGENCE",
    items: [
      { label: "Threat Analytics", to: "/analytics", icon: ChartNoAxesCombined },
      { label: "Attack Timeline", to: "/timeline", icon: Timeline },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { label: "Response Playbooks", to: "/playbooks", icon: BookOpenCheck },
      { label: "Reports", to: "/reports", icon: FileChartColumn },
      { label: "Settings", to: "/settings", icon: Settings },
    ],
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { alerts, realtimeStatus } = useSecurityData();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Security";
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim()) return;
    navigate(`/alerts?q=${encodeURIComponent(query.trim())}`);
  };

  const sidebar = (
    <>
      <div className="flex h-16 items-center border-b border-border px-5">
        <Brand />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {navigation.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="mb-2 px-3 text-[9px] font-semibold tracking-[0.16em] text-muted-foreground/75">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }: { isActive: boolean }) =>
                    `group relative flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors ${
                      isActive
                        ? "bg-lime-400/10 text-lime-600 dark:text-lime-400"
                        : "text-muted-foreground hover:bg-muted/65 hover:text-foreground"
                    }`
                  }
                >
                  {({ isActive }: { isActive: boolean }) => (
                    <>
                      {isActive && <span className="absolute -left-3 top-1.5 bottom-1.5 w-0.5 rounded-r bg-lime-400" />}
                      <item.icon className="size-4" strokeWidth={1.8} />
                      {item.label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/25 px-3 py-2.5">
          <span
            className={`size-2 rounded-full ${
              realtimeStatus === "connected"
                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,.55)]"
                : realtimeStatus === "connecting"
                  ? "animate-pulse bg-amber-500"
                  : "bg-muted-foreground"
            }`}
          />
          <div className="min-w-0">
            <p className="text-[11px] font-medium">Supabase realtime</p>
            <p className="truncate text-[10px] capitalize text-muted-foreground">{realtimeStatus}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-border bg-sidebar lg:flex lg:flex-col">
        {sidebar}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/45"
            onClick={() => setMobileOpen(false)}
            type="button"
          />
          <aside className="relative flex h-full w-72 flex-col border-r border-border bg-sidebar">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur md:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="grid size-9 place-items-center rounded-md border border-border text-muted-foreground lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-4" />
          </button>

          <form onSubmit={handleSearch} className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search alerts, users, event types..."
              className="h-9 w-full rounded-md border border-border bg-muted/35 pl-9 pr-14 text-xs outline-none transition focus:border-lime-400/60 focus:ring-2 focus:ring-lime-400/10"
            />
            <span className="pointer-events-none absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[9px] text-muted-foreground">
              <Command className="size-2.5" />K
            </span>
          </form>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleTheme}
              className="grid size-9 place-items-center rounded-md border border-transparent text-muted-foreground transition hover:border-border hover:bg-muted hover:text-foreground"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <button
              type="button"
              className="relative grid size-9 place-items-center rounded-md border border-transparent text-muted-foreground transition hover:border-border hover:bg-muted hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
              {alerts.length > 0 && <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-lime-400 ring-2 ring-background" />}
            </button>
            <div className="relative ml-1">
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                className="flex h-10 items-center gap-2 rounded-md border border-border bg-card px-2 transition hover:bg-muted/55"
              >
                <span className="grid size-7 place-items-center rounded-md bg-lime-400/12 text-[10px] font-semibold text-lime-600 dark:text-lime-400">
                  {initials}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block max-w-28 truncate text-[11px] font-medium">{displayName}</span>
                  <span className="block text-[9px] text-muted-foreground">Fintech workspace</span>
                </span>
                <ChevronDown className="hidden size-3.5 text-muted-foreground sm:block" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-popover p-1.5 shadow-xl shadow-black/10">
                  <div className="border-b border-border px-2.5 py-2">
                    <p className="truncate text-xs font-medium">{user?.email}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">Authenticated with Supabase</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void signOut()}
                    className="mt-1 flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    <LogOut className="size-3.5" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6 xl:p-7">{children}</main>
      </div>
    </div>
  );
}