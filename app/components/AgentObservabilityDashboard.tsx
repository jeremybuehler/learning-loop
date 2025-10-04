"use client";
import React, { useMemo, useState } from "react";
import { Activity, Server, Shield } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const latencySeries = [
  { time: "00:00", latency: 120, success: 95 },
  { time: "01:00", latency: 200, success: 90 },
  { time: "02:00", latency: 180, success: 92 },
  { time: "03:00", latency: 150, success: 94 },
  { time: "04:00", latency: 130, success: 97 },
];

const logItems = `[
00:01] agent-42 executed tool-x with params {...}
[00:02] agent-42 returned result successfully.
[00:03] agent-42 latency spike detected: 200ms.
`.trim();

const tabs = [
  { key: "logs", label: "Logs" },
  { key: "traces", label: "Traces" },
  { key: "reports", label: "Reports" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function AgentObservabilityDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("logs");
  const tabContent = useMemo(() => {
    switch (activeTab) {
      case "logs":
        return (
          <pre className="bg-gray-950 text-gray-100 font-mono text-xs p-4 rounded-xl h-64 overflow-y-auto whitespace-pre-wrap">
            {logItems}
          </pre>
        );
      case "traces":
        return (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Visual trace graphs plug in via /console/telemetry data sources.
          </p>
        );
      case "reports":
        return (
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <p>Generate PDF/CSV performance and compliance reports on demand.</p>
            <button className="inline-flex items-center justify-center rounded-xl bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm font-semibold">
              Generate Report
            </button>
          </div>
        );
      default:
        return null;
    }
  }, [activeTab]);

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      <div className="xl:col-span-3 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-2xl font-bold">AI Agent Observability</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Register, monitor, and score agents in real time.
          </p>
        </div>
        <button className="inline-flex items-center justify-center rounded-2xl bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm font-semibold">
          Add New Agent
        </button>
      </div>

      <DashboardCard title="Latency (ms)" icon={Activity}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={latencySeries}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" strokeWidth={0.5} />
            <YAxis strokeWidth={0.5} />
            <Tooltip contentStyle={{ fontSize: "12px" }} />
            <Line type="monotone" dataKey="latency" stroke="#2563eb" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </DashboardCard>

      <DashboardCard title="Success Rate (%)" icon={Server}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={latencySeries}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" strokeWidth={0.5} />
            <YAxis domain={[80, 100]} strokeWidth={0.5} />
            <Tooltip contentStyle={{ fontSize: "12px" }} />
            <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </DashboardCard>

      <DashboardCard title="Safety & Alignment" icon={Shield}>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Current safety score: <span className="font-semibold text-green-600 dark:text-green-400">92%</span>
        </p>
        <button className="mt-4 w-full rounded-xl border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm font-semibold">
          View Safety Report
        </button>
      </DashboardCard>

      <div className="xl:col-span-3 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition border ${
                activeTab === tab.key
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                  : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {tabContent}
      </div>
    </div>
  );
}

type DashboardCardProps = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
};

function DashboardCard({ title, icon: Icon, children }: DashboardCardProps) {
  return (
    <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5" />
        <h4 className="text-lg font-semibold">{title}</h4>
      </div>
      {children}
    </div>
  );
}
