import { useState } from "react";
import { BrainCircuit, Loader2, Play, Radio } from "lucide-react";
import { Panel } from "@/components/siem/Panel";
import { SeverityBadge } from "@/components/siem/SeverityBadge";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const SAMPLE_MESSAGES: Record<string, string> = {
  email: "URGENT: This is the CEO. I need you to process an urgent wire transfer today, reply ASAP.",
  sms: "Your UPI payment of Rs.15000 failed. Update details: http://bit.ly/x92kd",
  qr: "Scan this QR code to verify your parking payment and avoid a fine: http://secure-verify-bank.co/qr",
  call: "This is calling from your bank's fraud department, we need to verify your card details urgently.",
};

type SimulateResponse = {
  stages: Record<string, any>;
  final: {
    should_alert: boolean;
    severity?: string;
    chain?: { stage: string; type: string; timestamp: string; score?: number }[];
    summary?: string;
    recommendation?: string;
  };
};

export default function SimulatorPage() {
  const [channel, setChannel] = useState("email");
  const [text, setText] = useState(SAMPLE_MESSAGES.email);
  const [userId, setUserId] = useState("live_demo_user");
  const [includeLogin, setIncludeLogin] = useState(true);
  const [includeNetwork, setIncludeNetwork] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChannelChange = (value: string) => {
    setChannel(value);
    setText(SAMPLE_MESSAGES[value] || "");
  };

  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId || "live_demo_user",
          channel,
          text,
          simulate_login_anomaly: includeLogin,
          simulate_network_anomaly: includeNetwork,
        }),
      });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = (await res.json()) as SimulateResponse;
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} — is the backend running? (uvicorn api:app --reload --port 8000)`
          : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  const classifierScore = result?.stages?.classifier?.score;
  const isFlagged = result?.stages?.classifier?.is_flagged;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
          Live detection
        </p>
        <h1 className="text-2xl font-semibold tracking-[-0.04em]">Live Threat Simulator</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Type any message below and submit — this runs the real classifier, anomaly detector, and
          correlation engine live, then writes the result to the same database powering the rest of
          this dashboard.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Panel title="Simulate an Event" eyebrow="INPUT">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Channel
              </label>
              <div className="flex flex-wrap gap-1.5">
                {["email", "sms", "qr", "call"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleChannelChange(c)}
                    className={`rounded-md border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                      channel === c
                        ? "border-lime-400/40 bg-lime-400/10 text-lime-600 dark:text-lime-400"
                        : "border-border text-muted-foreground hover:bg-muted/60"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Message text
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-border bg-card p-3 text-xs outline-none focus:border-lime-400/60 focus:ring-2 focus:ring-lime-400/10"
                placeholder="Paste or type any email/SMS/message text..."
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Target user ID
              </label>
              <input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full rounded-md border border-border bg-card px-3 py-2 text-xs outline-none focus:border-lime-400/60"
                placeholder="e.g. finance_raj"
              />
            </div>

            <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={includeLogin}
                  onChange={(e) => setIncludeLogin(e.target.checked)}
                  className="accent-lime-500"
                />
                Also simulate a follow-up anomalous login (12 min later)
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={includeNetwork}
                  onChange={(e) => setIncludeNetwork(e.target.checked)}
                  className="accent-lime-500"
                />
                Also simulate follow-up malware-symptom network activity (14 min later)
              </label>
            </div>

            <button
              type="button"
              onClick={runSimulation}
              disabled={loading || !text.trim()}
              className="primary-button w-full"
            >
              {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
              {loading ? "Running detection pipeline..." : "Run Live Detection"}
            </button>

            {error && (
              <p className="rounded-md border border-red-500/25 bg-red-500/8 p-2.5 text-[11px] text-red-500">
                {error}
              </p>
            )}
          </div>
        </Panel>

        <Panel title="Live Pipeline Output" eyebrow={loading ? "PROCESSING" : "RESULT"}>
          {!result && !loading && (
            <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-center text-muted-foreground">
              <Radio className="mb-3 size-6" />
              <p className="text-xs">Run a simulation to see the model's reasoning here.</p>
            </div>
          )}

          {loading && (
            <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <Loader2 className="size-6 animate-spin" />
              <p className="text-xs">Classifying message, checking anomalies, correlating...</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Stage 1 — Text classifier
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${isFlagged ? "bg-red-500" : "bg-lime-400"}`}
                      style={{ width: `${Math.round((classifierScore || 0) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold tabular-nums">
                    {classifierScore != null ? Math.round(classifierScore * 100) : 0}%
                  </span>
                </div>
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  {isFlagged
                    ? `Flagged as ${result.stages?.classifier?.event_type}`
                    : "Not flagged — classified as legitimate"}
                </p>
              </div>

              {result.final?.should_alert ? (
                <>
                  <div className="flex items-center gap-2">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      Final correlated severity
                    </p>
                    <SeverityBadge severity={result.final.severity} />
                  </div>

                  <div>
                    <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      Attack chain
                    </p>
                    <div className="space-y-1.5">
                      {result.final.chain?.map((step, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 rounded-md border border-border bg-muted/15 px-2.5 py-1.5 text-[11px]"
                        >
                          <span className="grid size-5 place-items-center rounded-full bg-lime-400/15 text-[9px] font-semibold text-lime-600 dark:text-lime-400">
                            {i + 1}
                          </span>
                          <span className="font-medium">{step.type}</span>
                          {step.score != null && (
                            <span className="ml-auto text-muted-foreground">score {step.score}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-lime-400/20 bg-lime-400/6 p-3">
                    <div className="flex items-start gap-2">
                      <BrainCircuit className="mt-0.5 size-3.5 shrink-0 text-lime-500" />
                      <p className="text-xs leading-5">{result.final.summary}</p>
                    </div>
                  </div>

                  <p className="rounded-md border border-border bg-muted/15 p-2.5 text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground">Recommendation: </span>
                    {result.final.recommendation}
                  </p>

                  <p className="text-[10px] text-muted-foreground">
                    ✓ Written to Supabase — check the Alerts or Incidents page, it should appear there
                    live via realtime sync.
                  </p>
                </>
              ) : (
                <p className="rounded-md border border-border bg-muted/15 p-3 text-xs text-muted-foreground">
                  No alert generated — this message/activity did not trigger any detection thresholds.
                </p>
              )}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}