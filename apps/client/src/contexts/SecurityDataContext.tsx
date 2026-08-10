import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { AlertRecord, IncidentRecord, RawLogRecord } from "@/lib/siem-types";
import { useAuth } from "./AuthContext";

interface SecurityDataContextValue {
  alerts: AlertRecord[];
  incidents: IncidentRecord[];
  rawLogs: RawLogRecord[];
  loading: boolean;
  error: string | null;
  realtimeStatus: "connecting" | "connected" | "disconnected";
  refresh: () => Promise<void>;
  logResponseAction: (action: string, targetType: "alert" | "incident", targetId: string) => Promise<void>;
  updateStatus: (targetType: "alert" | "incident", targetId: string, status: string) => Promise<void>;
}

const SecurityDataContext = createContext<SecurityDataContextValue | null>(null);

function upsertById<T extends { id: string }>(items: T[], next: T): T[] {
  const existingIndex = items.findIndex((item) => item.id === next.id);
  if (existingIndex === -1) return [next, ...items];
  return items.map((item) => (item.id === next.id ? next : item));
}

export function SecurityDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [rawLogs, setRawLogs] = useState<RawLogRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] =
    useState<SecurityDataContextValue["realtimeStatus"]>("disconnected");

  const refresh = useCallback(async () => {
    if (!user) {
      setAlerts([]);
      setIncidents([]);
      setRawLogs([]);
      return;
    }

    setLoading(true);
    setError(null);
    const [alertsResult, incidentsResult, logsResult] = await Promise.all([
      supabase
        .from("alerts")
        .select("*")
        .neq("status", "resolved")
        .order("created_at", { ascending: false })
        .limit(500),
      supabase
        .from("incidents")
        .select("*")
        .neq("status", "resolved")
        .order("created_at", { ascending: false })
        .limit(250),
      supabase.from("raw_logs").select("*").order("created_at", { ascending: false }).limit(250),
    ]);

    const firstError = alertsResult.error ?? incidentsResult.error ?? logsResult.error;
    if (firstError) {
      setError(firstError.message);
    } else {
      setAlerts((alertsResult.data ?? []) as AlertRecord[]);
      setIncidents((incidentsResult.data ?? []) as IncidentRecord[]);
      setRawLogs((logsResult.data ?? []) as RawLogRecord[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user) {
      setRealtimeStatus("disconnected");
      return;
    }

    setRealtimeStatus("connecting");
    const channel = supabase
      .channel(`siemless-live-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alerts" },
        (payload) => {
          const newRecord = payload.new as AlertRecord | undefined;
          if (payload.eventType === "DELETE" || newRecord?.status === "resolved") {
            const removeId = payload.eventType === "DELETE" ? String(payload.old.id) : newRecord?.id;
            setAlerts((items) => items.filter((item) => item.id !== removeId));
            return;
          }
          setAlerts((items) => upsertById(items, newRecord as AlertRecord));
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incidents" },
        (payload) => {
          const newRecord = payload.new as IncidentRecord | undefined;
          if (payload.eventType === "DELETE" || newRecord?.status === "resolved") {
            const removeId = payload.eventType === "DELETE" ? String(payload.old.id) : newRecord?.id;
            setIncidents((items) => items.filter((item) => item.id !== removeId));
            return;
          }
          setIncidents((items) => upsertById(items, newRecord as IncidentRecord));
        },
      )
      .subscribe((status) => {
        setRealtimeStatus(status === "SUBSCRIBED" ? "connected" : status === "CHANNEL_ERROR" ? "disconnected" : "connecting");
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user]);

  const logResponseAction = useCallback(
    async (action: string, targetType: "alert" | "incident", targetId: string) => {
      if (!user) return;
      const { error: insertError } = await supabase.from("raw_logs").insert({
        log_type: "response_action",
        user_id: user.id,
        content: {
          action,
          target_type: targetType,
          target_id: targetId,
          source: "siemless",
          performed_at: new Date().toISOString(),
        },
      });

      if (insertError) {
        toast.error("Action could not be recorded", { description: insertError.message });
        return;
      }

      toast.success(`${action} recorded`, {
        description: "The response action was appended to raw_logs for auditability.",
      });
    },
    [user],
  );

  const updateStatus = useCallback(
    async (targetType: "alert" | "incident", targetId: string, status: string) => {
      const table = targetType === "alert" ? "alerts" : "incidents";
      const { error: updateError } = await supabase
        .from(table)
        .update({ status, resolved_at: status === "resolved" ? new Date().toISOString() : null })
        .eq("id", targetId);

      if (updateError) {
        toast.error("Status could not be updated", { description: updateError.message });
        return;
      }

      if (status === "resolved") {
        if (targetType === "alert") {
          setAlerts((items) => items.filter((item) => item.id !== targetId));
        } else {
          setIncidents((items) => items.filter((item) => item.id !== targetId));
        }
      } else {
        if (targetType === "alert") {
          setAlerts((items) => items.map((item) => (item.id === targetId ? { ...item, status } : item)));
        } else {
          setIncidents((items) => items.map((item) => (item.id === targetId ? { ...item, status } : item)));
        }
      }

      toast.success(status === "resolved" ? "Marked as resolved" : `Status updated to ${status}`);
    },
    [],
  );

  const value = useMemo(
    () => ({
      alerts,
      incidents,
      rawLogs,
      loading,
      error,
      realtimeStatus,
      refresh,
      logResponseAction,
      updateStatus,
    }),
    [alerts, error, incidents, loading, logResponseAction, rawLogs, realtimeStatus, refresh, updateStatus],
  );

  return <SecurityDataContext.Provider value={value}>{children}</SecurityDataContext.Provider>;
}

export function useSecurityData() {
  const context = useContext(SecurityDataContext);
  if (!context) throw new Error("useSecurityData must be used inside SecurityDataProvider");
  return context;
}