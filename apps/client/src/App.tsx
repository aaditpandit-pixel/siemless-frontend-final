import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import NotFound from "./pages/not-found/Index";
import DashboardPage from "./pages/dashboard/Index";
import LoginPage from "./pages/login/Index";
import AlertsPage from "./pages/alerts/Index";
import IncidentsPage from "./pages/incidents/Index";
import DetailPage from "./pages/detail/Index";
import AnalyticsPage from "./pages/analytics/Index";
import TimelinePage from "./pages/timeline/Index";
import PlaybooksPage from "./pages/playbooks/Index";
import ReportsPage from "./pages/reports/Index";
import SettingsPage from "./pages/settings/Index";
import SimulatorPage from "./pages/simulator/Index";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SecurityDataProvider } from "./contexts/SecurityDataContext";
import { RequireSupabaseAuth } from "./components/siem/RouteGuard";
import { AppShell } from "./components/siem/AppShell";

const queryClient = new QueryClient();

function ProtectedLayout() {
  return (
    <RequireSupabaseAuth>
      <SecurityDataProvider>
        <AppShell>
          <Outlet />
        </AppShell>
      </SecurityDataProvider>
    </RequireSupabaseAuth>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth" element={<Navigate to="/login" replace />} />
              <Route element={<ProtectedLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/alerts/:id" element={<DetailPage type="alert" />} />
                <Route path="/incidents" element={<IncidentsPage />} />
                <Route path="/incidents/:id" element={<DetailPage type="incident" />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/timeline" element={<TimelinePage />} />
                <Route path="/playbooks" element={<PlaybooksPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/simulator" element={<SimulatorPage />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
