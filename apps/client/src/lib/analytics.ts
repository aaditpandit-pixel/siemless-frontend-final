import { format, isAfter, startOfDay, subDays } from "date-fns";
import type { AlertRecord, IncidentRecord } from "./siem-types";
import { normalizeChain, normalizeSeverity, severityWeight } from "./siem-types";

export function buildDailyTrend(alerts: AlertRecord[], incidents: IncidentRecord[], days = 14) {
  return Array.from({ length: days }, (_, index) => {
    const date = startOfDay(subDays(new Date(), days - index - 1));
    const nextDate = startOfDay(subDays(new Date(), days - index - 2));
    return {
      date: format(date, "MMM d"),
      alerts: alerts.filter((item) => {
        const value = new Date(item.created_at);
        return !Number.isNaN(value.getTime()) && isAfter(value, date) && value < nextDate;
      }).length,
      incidents: incidents.filter((item) => {
        const value = new Date(item.created_at);
        return !Number.isNaN(value.getTime()) && isAfter(value, date) && value < nextDate;
      }).length,
    };
  });
}

export function buildSeverityData(alerts: AlertRecord[], incidents: IncidentRecord[]) {
  const counts = new Map<string, number>();
  [...alerts, ...incidents].forEach((item) => {
    const severity = normalizeSeverity(item.severity);
    counts.set(severity, (counts.get(severity) ?? 0) + 1);
  });
  return ["critical", "high", "medium", "low", "info"]
    .map((name) => ({ name, value: counts.get(name) ?? 0 }))
    .filter((item) => item.value > 0);
}

export function buildAttackTypes(alerts: AlertRecord[], incidents: IncidentRecord[]) {
  const counts = new Map<string, number>();
  alerts.forEach((alert) => {
    const label = alert.event_type || "Unknown event";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });
  incidents.forEach((incident) => {
    const firstStep = normalizeChain(incident.chain)[0]?.label || "Incident";
    counts.set(firstStep, (counts.get(firstStep) ?? 0) + 1);
  });
  return [...counts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);
}

export function buildUserRisk(alerts: AlertRecord[], incidents: IncidentRecord[]) {
  const users = new Map<string, { events: number; total: number; critical: number }>();
  [...alerts, ...incidents].forEach((item) => {
    const key = item.user_id || "unknown";
    const current = users.get(key) ?? { events: 0, total: 0, critical: 0 };
    current.events += 1;
    current.total += severityWeight(item.severity);
    if (normalizeSeverity(item.severity) === "critical") current.critical += 1;
    users.set(key, current);
  });
  return [...users.entries()]
    .map(([user, data]) => ({
      user,
      events: data.events,
      critical: data.critical,
      score: Math.min(100, Math.round(data.total / Math.max(1, data.events))),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

export function buildSparkline(values: Array<{ created_at: string }>, points = 8) {
  const daysPerPoint = 3;
  return Array.from({ length: points }, (_, index) => {
    const end = subDays(new Date(), (points - index - 1) * daysPerPoint);
    const start = subDays(end, daysPerPoint);
    return values.filter((item) => {
      const date = new Date(item.created_at);
      return date >= start && date < end;
    }).length;
  });
}

export function calculateThreatScore(alerts: AlertRecord[], incidents: IncidentRecord[]) {
  const events = [...alerts, ...incidents];
  if (events.length === 0) return 0;
  return Math.round(events.reduce((sum, item) => sum + severityWeight(item.severity), 0) / events.length);
}
