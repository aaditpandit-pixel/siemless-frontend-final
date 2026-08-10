export type Severity = "critical" | "high" | "medium" | "low" | "info" | string;

export interface AlertRecord {
  id: string;
  user_id: string;
  event_type: string;
  score: number;
  severity: Severity;
  summary: string;
  recommendation: string;
  created_at: string;
  status?: string;
}

export interface IncidentRecord {
  id: string;
  user_id: string;
  chain: unknown;
  severity: Severity;
  summary: string;
  recommendation: string;
  created_at: string;
  status?: string;
}

export interface RawLogRecord {
  id: string;
  log_type: string;
  user_id: string;
  content: unknown;
  created_at: string;
}

export interface ChainStep {
  label: string;
  detail?: string;
  timestamp?: string;
  state: "normal" | "suspicious" | "compromised";
}

export function normalizeSeverity(value?: string | null): string {
  return (value || "unknown").toLowerCase();
}

export function severityWeight(value?: string | null): number {
  const severity = normalizeSeverity(value);
  if (severity === "critical") return 100;
  if (severity === "high") return 75;
  if (severity === "medium") return 50;
  if (severity === "low") return 25;
  return 10;
}

function inferStepState(label: string, index: number, length: number): ChainStep["state"] {
  const text = label.toLowerCase();
  if (
    text.includes("critical") ||
    text.includes("compromise") ||
    text.includes("malware") ||
    text.includes("exfil") ||
    text.includes("sensitive")
  ) {
    return "compromised";
  }
  if (
    text.includes("anomaly") ||
    text.includes("suspicious") ||
    text.includes("phish") ||
    text.includes("unusual") ||
    text.includes("failed")
  ) {
    return "suspicious";
  }
  if (index === length - 1 && length > 2) return "compromised";
  if (index > 0) return "suspicious";
  return "normal";
}

export function normalizeChain(chain: unknown): ChainStep[] {
  let value = chain;
  if (typeof value === "string") {
    const stringValue = value;
    try {
      value = JSON.parse(stringValue) as unknown;
    } catch {
      value = stringValue
        .split(/ΓåÆ|->|,/)
        .map((item: string) => item.trim())
        .filter(Boolean);
    }
  }

  const rawSteps = Array.isArray(value)
    ? value
    : value && typeof value === "object"
      ? Object.entries(value as Record<string, unknown>).map(([key, item]) =>
          typeof item === "object" && item !== null ? { name: key, ...item } : `${key}: ${String(item)}`,
        )
      : [];

  return rawSteps.map((step, index) => {
    if (typeof step === "string") {
      return {
        label: step,
        state: inferStepState(step, index, rawSteps.length),
      };
    }

    if (step && typeof step === "object") {
      const record = step as Record<string, unknown>;
      const label = String(
        record.label ?? record.name ?? record.event ?? record.type ?? record.title ?? `Step ${index + 1}`,
      );
      const rawState = String(record.state ?? record.status ?? "").toLowerCase();
      const state: ChainStep["state"] =
        rawState.includes("comprom") || rawState.includes("critical") || rawState.includes("confirm")
          ? "compromised"
          : rawState.includes("susp") || rawState.includes("warn")
            ? "suspicious"
            : inferStepState(label, index, rawSteps.length);

      return {
        label,
        detail: record.detail ? String(record.detail) : record.description ? String(record.description) : undefined,
        timestamp: record.timestamp ? String(record.timestamp) : record.created_at ? String(record.created_at) : undefined,
        state,
      };
    }

    const label = String(step);
    return { label, state: inferStepState(label, index, rawSteps.length) };
  });
}

export function splitRecommendations(value?: string | null): string[] {
  if (!value) return [];
  return value
    .split(/\n|;|ΓÇó|\.(?:\s+|$)/)
    .map((item) => item.replace(/^[-\d.)\s]+/, "").trim())
    .filter((item) => item.length > 2);
}