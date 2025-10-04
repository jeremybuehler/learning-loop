"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Infinity as InfinityIcon, Brain, Repeat2, Gauge, ShieldCheck, LineChart, Workflow, Upload, Settings, UserCheck, TimerReset, Mail, Moon, Sun, CheckCircle2, ChevronRight, Menu, X } from "lucide-react";
import {
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import AgentObservabilityDashboard from "./AgentObservabilityDashboard";

// Internal docs gate (Next.js client env)
const ENABLE_INTERNAL_DOCS = (process.env.NEXT_PUBLIC_ENABLE_INTERNAL_DOCS === "true");

// ============================================================
// LearningLoop Agent — Fully Functional Website (React SPA)
// - Single-file app (export default React component)
// - Tailwind for styling (no imports needed here)
// - Uses lucide-react, framer-motion, mermaid, recharts
// - Includes: Hero, Features, Diagram, Docs (Tabs), Live Metrics, Pricing, Contact
// - Dark Mode toggle, Basic form validation
// ============================================================

const prdMarkdown = `# LearningLoop Agent — PRD

**Product**: LearningLoop Agent  
**Owner**: Platform AI / Observability  
**Audience**: Product, Engineering, Design, RevOps, Compliance

## 1. Summary & Vision
The LearningLoop Agent is the observability + adaptation layer for AI-first applications. It closes the loop between user experience, system performance, and model improvement. The agent continuously observes, evaluates, learns, and adapts with human oversight where needed.

## 2. Goals
- Detect drift, anomalies, and UX breakdowns in near real time.
- Route high-value signals (errors, edge cases, corrections) to retraining.
- Provide auditability and compliance visibility.
- Automate safe redeployments and agent reconfiguration.
- Enable a scoring framework for agents and workflows.

## 3. Key Features
1. **Observability Layer** — telemetry (latency, accuracy, drift), UX interaction monitoring.
2. **Evaluation Engine** — scoring for predictions & outcomes; configurable thresholds.
3. **Learning Pipeline Integration** — labeled data -> retraining; active learning; RAG updates.
4. **Adaptation Layer** — reconfigure orchestration (MCP), CI/CD hooks for redeploys.
5. **Human-in-the-Loop (HITL)** — reviewer workflows; SME validators; audit trails.

## 4. Success Metrics
- MTTD (Mean Time to Drift Detection): < 24 hours
- MTTR (Mean Time to Retraining): < 7 days (high-impact)
- UX Correction Capture Rate: > 90%
- Agent Confidence Stability: ±5% of target thresholds

## 5. Dependencies
- Vector DB (e.g., Pinecone/pgvector)
- Model registry & pipelines (e.g., MLflow/Vertex/Custom)
- Observability (e.g., Prometheus/Grafana/Langfuse)
- MCP-compatible orchestration

## 6. Non-Goals
- Serving as the primary data warehouse or BI tool
- Replacing human judgment in compliance-critical decisions

## 7. Risks & Mitigations
- **Silent drift** → robust statistical checks & canary evals
- **Over-automation** → HITL gates, rollback paths
- **Data privacy** → PII scrubbing, role-based access, encryption at rest / in transit

## 8. Phases & Milestones

### Phase 0 — Demo Website & UX Shell (Status: Complete)
- Deliverables: Next.js SPA (App Router), dark mode, static SVG diagram, live metrics demo, contact form with basic validation, internal Docs tab (flagged).
- Outcome: Public‑facing demo site that communicates vision and feature set.

### Phase 1 — Observability Layer MVP (Status: Next)
- Deliverables: Hardened /api/telemetry (validation, rate limits, API key), persisted store (Postgres), schema + migrations, sampling, basic dashboards for telemetry and feedback.
- Exit Criteria: Pipeline emits baseline MTTD/MTTR dashboards; telemetry and feedback lists accessible.

### Phase 2 — Evaluation Engine
- Deliverables: Scoring functions, threshold config, anomaly detection, canary evals, alerting webhooks; status endpoints.
- Exit Criteria: Alerts fire on drift/threshold breaches; canaries run on schedule.

### Phase 3 — Learning Pipeline Integration
- Deliverables: Feedback router to labeling store, retraining queue integration, RAG/context refresh hooks.
- Exit Criteria: Closed loop from flagged cases to retraining artifacts.

### Phase 4 — Adaptation Layer (MCP)
- Deliverables: Safe reconfiguration workflows, rollout hooks/feature flags, automated promotion/rollback gates.
- Exit Criteria: Controlled updates to agents and UX without downtime; rollback tested.

### Phase 5 — HITL & Compliance
- Deliverables: Reviewer UI, SME validator flows, audit logs, RBAC/SSO, PII controls.
- Exit Criteria: Compliance reviews traceable end‑to‑end; access controlled by role.

### Phase 6 — Production Hardening
- Deliverables: SLOs/SLA, rate limiting, error budgets, observability (traces/metrics/logs), runbooks.
- Exit Criteria: Agreed SLOs met in staging; incident playbooks validated.
`;

const specJson = {
  name: "LearningLoop Agent",
  version: "1.0",
  components: {
    TelemetryCollector: {
      inputs: ["model_metrics", "ux_events", "logs"],
      outputs: ["events_stream"],
    },
    EvaluationEngine: {
      inputs: ["events_stream"],
      outputs: ["alerts", "flags", "scores"],
      methods: ["outlierDetection", "confidenceCalibration", "thresholdChecks"],
    },
    FeedbackRouter: {
      inputs: ["flags"],
      outputs: ["human_review_queue", "retraining_queue"],
    },
    MCPAdapter: {
      inputs: ["alerts", "deployment_signals"],
      outputs: ["agent_reconfig", "deployment_triggers"],
    },
    LearningStore: {
      schema: ["feedback", "labels", "drift_events", "versions"],
      retention_days: 365,
    },
  },
  metrics: ["mttd", "mttr", "ux_correction_rate", "confidence_stability"],
  api: {
    ingest: {
      method: "POST",
      path: "/api/telemetry",
      body: {
        timestamp: "ISO8601",
        source: "string",
        type: "metric|event|trace",
        payload: "object",
      },
    },
    feedback: {
      method: "POST",
      path: "/api/feedback",
      body: {
        eventId: "string",
        label: "string",
        reviewer: "string",
        notes: "string",
      },
    },
    status: { method: "GET", path: "/api/status" },
  },
};

// Diagram is now a static SVG in public/images/learning-loop-diagram.svg

function useDarkMode(initial = false) {
  const [isDark, setIsDark] = useState(initial);
  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDark]);
  return { isDark, setIsDark } as const;
}

// Mermaid removed; static image used instead

function useLiveSeries() {
  const [data, setData] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      t: i,
      drift: Math.max(0, 20 + Math.sin(i / 2) * 10 + (Math.random() - 0.5) * 4),
    }))
  );
  useEffect(() => {
    const id = setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1]?.t ?? 0;
        const next = {
          t: last + 1,
          drift: Math.max(0, 20 + Math.sin((last + 1) / 2) * 10 + (Math.random() - 0.5) * 4),
        };
        const arr = [...prev.slice(-19), next];
        return arr;
      });
    }, 1300);
    return () => clearInterval(id);
  }, []);
  return data;
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 px-2 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-200">
      {children}
    </span>
  );
}

function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`py-16 md:py-24 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

const LinkBtn = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="inline-flex items-center gap-2 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm font-semibold shadow-sm hover:shadow transition"
  >
    {children}
  </a>
);

function NavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
    >
      {children}
    </a>
  );
}

export default function LearningLoopSite() {
  const { isDark, setIsDark } = useDarkMode(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"prd" | "tech" | "api">("prd");
  const series = useLiveSeries();

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState<null | { id: string }>(null);
  const [errors, setErrors] = useState<{ name?: string; email?: string } | null>(null);
  const [statusData, setStatusData] = useState({ status: "ok", mttd_hours: 12, mttr_days: 3 });
  const [statusLoading, setStatusLoading] = useState(true);

  const validate = () => {
    const newErr: any = {};
    if (!form.name.trim()) newErr.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErr.email = "Enter a valid email.";
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const id = Math.random().toString(36).slice(2, 9).toUpperCase();
    localStorage.setItem(
      `learningloop:request:${id}`,
      JSON.stringify({ ...form, ts: new Date().toISOString() }, null, 2)
    );
    setSubmitted({ id });
    setForm({ name: "", email: "", message: "" });
  };

  useEffect(() => {
    // Close mobile nav on route hash change
    const onHash = () => setMobileOpen(false);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadStatus() {
      try {
        const res = await fetch("/api/status", { cache: "no-store" });
        if (!res.ok) throw new Error("status fetch failed");
        const data = await res.json();
        if (!cancelled && data) {
          setStatusData({
            status: typeof data.status === "string" ? data.status : "unknown",
            mttd_hours: Number.isFinite(data.mttd_hours) ? data.mttd_hours : 12,
            mttr_days: Number.isFinite(data.mttr_days) ? data.mttr_days : 3,
          });
        }
      } catch {
        // keep defaults
      } finally {
        if (!cancelled) setStatusLoading(false);
      }
    }
    loadStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2 font-bold">
            <InfinityIcon className="h-6 w-6" />
            <span>LearningLoop</span>
          </a>
          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#diagram">Diagram</NavLink>
            <NavLink href="#console">Console</NavLink>
            {ENABLE_INTERNAL_DOCS && <NavLink href="#docs">Docs</NavLink>}
            <NavLink href="#metrics">Metrics</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            <NavLink href="#contact">Contact</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDark(!isDark)}
              aria-label="Toggle theme"
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm font-semibold shadow-sm hover:shadow transition"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
            </button>
            <a
              href="#contact"
              className="hidden sm:inline-flex items-center gap-2 rounded-2xl bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm font-semibold shadow hover:opacity-90"
            >
              <Mail className="h-4 w-4" /> Request Demo
            </a>
            <button className="md:hidden p-2" onClick={() => setMobileOpen((v) => !v)} aria-label="Open menu">
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 px-4 pb-4">
            <div className="flex flex-col gap-3 pt-3">
              {[
                ["#features", "Features"],
                ["#diagram", "Diagram"],
                ["#console", "Console"],
                ...(ENABLE_INTERNAL_DOCS ? ([["#docs", "Docs"]] as const) : []),
                ["#metrics", "Metrics"],
                ["#pricing", "Pricing"],
                ["#contact", "Contact"],
              ].map(([href, label]) => (
                <NavLink key={href} href={href} onClick={() => setMobileOpen(false)}>
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      <main id="top">
        {/* HERO */}
        <Section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_-20%,rgba(59,130,246,0.15),transparent)] dark:bg-[radial-gradient(80%_60%_at_50%_-20%,rgba(59,130,246,0.08),transparent)]" />
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <Badge>
                <Repeat2 className="h-3.5 w-3.5" /> Continuous learning built-in
              </Badge>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge>Phase 0 — Complete</Badge>
                <Badge>Next: Phase 1 — Observability</Badge>
              </div>
              <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-tight">
                Close the loop between <span className="text-blue-600 dark:text-blue-400">experience</span> and <span className="text-blue-600 dark:text-blue-400">improvement</span>
              </h1>
              <p className="mt-4 text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-prose">
                LearningLoop watches your AI workflows, evaluates outcomes, routes feedback to humans when it matters, and redeploys improvements safely. Your models, but less entropy.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {ENABLE_INTERNAL_DOCS && (
                  <a href="#docs" className="inline-flex items-center gap-2 rounded-2xl bg-black text-white dark:bg-white dark:text-black px-5 py-2.5 text-sm font-semibold shadow hover:opacity-90">
                    <BookIcon className="h-4 w-4" /> View Docs
                  </a>
                )}
                <a href="#contact" className="inline-flex items-center gap-2 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-2.5 text-sm font-semibold shadow-sm hover:shadow">
                  <Mail className="h-4 w-4" /> Request Demo
                </a>
              </div>
              <div className="mt-6 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> HITL controls</div>
                <div className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Drift detection</div>
                <div className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Safe rollouts</div>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl p-6"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: "Observability", icon: Gauge, desc: "Telemetry for models & UX with smart sampling." },
                  { title: "Evaluation Engine", icon: LineChart, desc: "Scores outcomes, flags anomalies, triggers action." },
                  { title: "Learning Pipeline", icon: Upload, desc: "Feeds labeled data to retraining jobs automatically." },
                  { title: "Adaptation", icon: Settings, desc: "Reconfigures agents and redeploys updates safely." },
                  { title: "HITL", icon: UserCheck, desc: "Reviewer workflows & SME gates for compliance." },
                  { title: "MCP Ready", icon: Workflow, desc: "Orchestrates updates across agent meshes." },
                ].map((f) => (
                  <div key={f.title} className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
                    <div className="flex items-center gap-3">
                      <f.icon className="h-5 w-5" />
                      <h3 className="font-semibold">{f.title}</h3>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{f.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </Section>

        {/* FEATURES */}
        <Section id="features">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Drift Radar", icon: TimerReset, desc: "Detects statistical drift with canary checks & alerts." },
              { title: "Audit-Ready", icon: ShieldCheck, desc: "Every correction & redeploy is tracked with diffs." },
              { title: "Confidence Guardrails", icon: Brain, desc: "Auto-escalate to humans when confidence dips." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <f.icon className="h-6 w-6" />
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{f.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* DIAGRAM */}
        <Section id="diagram" className="bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl md:text-3xl font-bold">How it works</h2>
            <Badge>
              <Workflow className="h-3.5 w-3.5" /> Closed-loop system
            </Badge>
          </div>
          <div className="mt-6 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
            <div className="w-full overflow-x-auto p-4">
              <img
                src="/images/learning-loop-diagram.svg"
                alt="LearningLoop closed-loop system: Observe → Evaluate → Learn → Adapt with Human-in-the-Loop"
                className="mx-auto max-w-full h-auto"
              />
            </div>
          </div>
        </Section>

        {/* CONSOLE PREVIEW */}
        <Section id="console" className="bg-gray-100 dark:bg-gray-950">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl md:text-3xl font-bold">Console Preview</h2>
            <Badge>
              <Gauge className="h-3.5 w-3.5" /> Phase 1
            </Badge>
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-2xl">
            A glimpse of the in-product console that ships with LearningLoop. Dashboard cards below mirror the real
            `/console` routes so teams can explore latency, reliability, and safety signals before connecting a live
            data source.
          </p>
          <div className="mt-6">
            <AgentObservabilityDashboard />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <LinkBtn href="/console">Open Console</LinkBtn>
            <LinkBtn href="/console/telemetry">Telemetry</LinkBtn>
            <LinkBtn href="/console/feedback">Feedback</LinkBtn>
          </div>
        </Section>

        {/* DOCS (internal only) */}
        {ENABLE_INTERNAL_DOCS && (
        <Section id="docs">
          <h2 className="text-2xl md:text-3xl font-bold">Documentation</h2>
          <div className="mt-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800 p-2">
              {[
                ["prd", "PRD"],
                ["tech", "Technical Spec"],
                ["api", "API"],
              ].map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setActiveTab(k as any)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold border transition ${
                    activeTab === k
                      ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                      : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="p-4">
              {activeTab === "prd" && (
                <pre className="whitespace-pre-wrap text-sm leading-6">{prdMarkdown}</pre>
              )}
              {activeTab === "tech" && (
                <div className="space-y-4 text-sm leading-6">
                  <h3 className="text-lg font-semibold">Architecture Components</h3>
                  <ul className="list-disc ml-6">
                    <li><strong>Telemetry Collector:</strong> Hooks in apps/models/agents emit metrics, events, traces.</li>
                    <li><strong>Evaluation Engine:</strong> Outlier detection, calibration checks, threshold rules.</li>
                    <li><strong>Feedback Router:</strong> Flags to human review or retraining queues.</li>
                    <li><strong>MCP Adapter:</strong> Publishes agent reconfiguration & deployment triggers.</li>
                    <li><strong>Learning Store:</strong> Feedback, labels, drift events, model versions.</li>
                  </ul>
                  <h4 className="font-semibold">Pseudocode</h4>
                  <pre className="bg-gray-950 text-gray-100 p-3 rounded-xl overflow-auto text-xs"><code>{`while True:\n    event = collect_event()\n    score = evaluate_event(event)\n\n    if score < threshold:\n        route_to(\"human_review\", event)\n    else:\n        route_to(\"model_update\", event)\n\n    if drift_detected():\n        trigger_retrain(model_id)\n\n    if retrain_successful(model_id):\n        redeploy_model(model_id)`}</code></pre>
                  <h4 className="font-semibold">Types (TypeScript)</h4>
                  <pre className="bg-gray-950 text-gray-100 p-3 rounded-xl overflow-auto text-xs"><code>{`type Telemetry = {\n  timestamp: string;\n  source: string;\n  type: \"metric\" | \"event\" | \"trace\";\n  payload: Record<string, any>;\n};\n\ntype Feedback = {\n  eventId: string;\n  label: string;\n  reviewer?: string;\n  notes?: string;\n};`}</code></pre>
                </div>
              )}
              {activeTab === "api" && (
                <div className="text-sm leading-6 space-y-4">
                  <h3 className="text-lg font-semibold">Endpoints</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                      <h4 className="font-semibold">POST /api/telemetry</h4>
                      <pre className="mt-2 bg-gray-950 text-gray-100 p-3 rounded-lg overflow-auto text-xs"><code>{JSON.stringify(specJson.api.ingest, null, 2)}</code></pre>
                      <button
                        onClick={() => alert("Simulated: telemetry ingested ✔")}
                        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 text-xs font-semibold"
                      >
                        Try it <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                      <h4 className="font-semibold">POST /api/feedback</h4>
                      <pre className="mt-2 bg-gray-950 text-gray-100 p-3 rounded-lg overflow-auto text-xs"><code>{JSON.stringify(specJson.api.feedback, null, 2)}</code></pre>
                      <button
                        onClick={() => alert("Simulated: feedback queued for review ✔")}
                        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 text-xs font-semibold"
                      >
                        Try it <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                    <h4 className="font-semibold">GET /api/status</h4>
                    <pre className="mt-2 bg-gray-950 text-gray-100 p-3 rounded-lg overflow-auto text-xs"><code>{JSON.stringify({ status: "ok", mttd_hours: 12, mttr_days: 3 }, null, 2)}</code></pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Section>
        )}

        {/* METRICS */}
        <Section id="metrics" className="bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl md:text-3xl font-bold">Live Metrics (demo)</h2>
            <Badge>
              <LineChart className="h-3.5 w-3.5" /> Drift signal
            </Badge>
          </div>
          <div className="mt-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
              <div>Status: {statusLoading ? "Loading…" : statusData.status.toUpperCase()}</div>
              <div>Source: /api/status</div>
            </div>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RLineChart data={series} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="t" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ fontSize: "12px" }} />
                  <Line type="monotone" dataKey="drift" dot={false} strokeWidth={2} />
                </RLineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { k: "MTTD", v: statusLoading ? "--" : `${statusData.mttd_hours}h`, desc: "Mean Time to Drift Detection" },
              { k: "MTTR", v: statusLoading ? "--" : `${statusData.mttr_days}d`, desc: "Mean Time to Retraining" },
              { k: "Capture", v: "94%", desc: "UX correction capture rate" },
              { k: "Conf.", v: "+/-4%", desc: "Confidence stability" },
            ].map((m) => (
              <div key={m.k} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                <div className="text-2xl font-extrabold">{m.v}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{m.k} — {m.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* PRICING */}
        <Section id="pricing">
          <h2 className="text-2xl md:text-3xl font-bold">Pricing</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Simple tiers. Cancel anytime.</p>
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Starter",
                price: "$49",
                features: ["Telemetry SDK", "Basic drift checks", "Email alerts"],
                cta: "Start",
              },
              {
                name: "Growth",
                price: "$149",
                features: ["Active learning queue", "HITL workflows", "Rollout guardrails"],
                highlight: true,
                cta: "Upgrade",
              },
              {
                name: "Enterprise",
                price: "Custom",
                features: ["SSO & RBAC", "PII scrubbing", "On-prem options"],
                cta: "Contact Sales",
              },
            ].map((p) => (
              <div
                key={p.name}
                className={`rounded-3xl border bg-white dark:bg-gray-900 p-6 shadow-sm ${
                  p.highlight
                    ? "border-blue-500 ring-2 ring-blue-500/20 dark:border-blue-400"
                    : "border-gray-200 dark:border-gray-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  {p.highlight && <Badge>Popular</Badge>}
                </div>
                <div className="mt-3 text-3xl font-extrabold">{p.price}<span className="text-base font-medium text-gray-600 dark:text-gray-300">/mo</span></div>
                <ul className="mt-4 space-y-2 text-sm">
                  {p.features.map((f: string) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <a href="#contact" className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm font-semibold">
                  {p.cta} <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </Section>

        {/* CONTACT */}
        <Section id="contact" className="bg-white dark:bg-gray-900">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Request a demo</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-prose">
                Give us a bit of context. We’ll follow up with a tailored walkthrough and a sandbox environment.
              </p>
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                    className={`mt-1 w-full rounded-xl border bg-transparent px-3 py-2 outline-none ${
                      errors?.name ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                    }`}
                    placeholder="Ada Lovelace"
                  />
                  {errors?.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                    className={`mt-1 w-full rounded-xl border bg-transparent px-3 py-2 outline-none ${
                      errors?.email ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                    }`}
                    placeholder="you@example.com"
                  />
                  {errors?.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}
                    className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2 outline-none border-gray-300 dark:border-gray-700 min-h-[120px]"
                    placeholder="Tell us about your stack, use cases, and where you want the loop to close."
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-2xl bg-black text-white dark:bg-white dark:text-black px-5 py-2.5 text-sm font-semibold shadow hover:opacity-90"
                >
                  <Mail className="h-4 w-4" /> Submit
                </button>
                {submitted && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Request received. Tracking ID <span className="font-mono">{submitted.id}</span>. We saved your request locally for your records.
                  </p>
                )}
              </form>
            </div>
            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-semibold">What happens next?</h3>
              <ol className="mt-3 list-decimal ml-6 space-y-2 text-sm">
                <li>We review your use case & map the observability hooks.</li>
                <li>We configure evaluation thresholds & drift checks.</li>
                <li>We enable HITL lanes and deploy a sandbox loop.</li>
              </ol>
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
                  <div className="text-xs text-gray-500">HITL Mode</div>
                  <div className="text-lg font-bold">Enabled</div>
                </div>
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
                  <div className="text-xs text-gray-500">Canary Evals</div>
                  <div className="text-lg font-bold">Nightly</div>
                </div>
              </div>
              <div className="mt-6">
                <div className="text-xs text-gray-500">Quick links</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ENABLE_INTERNAL_DOCS && (
                    <LinkBtn href="#docs"><BookIcon className="h-3.5 w-3.5" /> Docs</LinkBtn>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <InfinityIcon className="h-5 w-5" />
            <span className="text-sm">LearningLoop — Observe • Evaluate • Learn • Adapt</span>
          </div>
          <div className="text-xs text-gray-500">© {new Date().getFullYear()} LearningLoop. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

function BookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M20 22H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20z" />
    </svg>
  );
}
