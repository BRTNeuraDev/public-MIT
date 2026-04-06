"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase";

/** Shape of a single analytics event */
interface AnalyticsEvent {
  action: "use" | "download";
  at: string;
  ua: string;
}

/** Shape of analytics data stored per tool in Firestore */
interface ToolData {
  slug: string;
  name: string;
  totalUses: number;
  downloads: number;
  lastUsedAt: { toDate?: () => Date } | null;
  dailyUses: Record<string, number>;
  hourlyDist: Record<string, number>;
  events: AnalyticsEvent[];
}

/** Sort key options for the tool table */
type SortKey = "totalUses" | "downloads" | "lastUsedAt";

/** Parses device type from user agent string */
function parseDevice(ua: string): string {
  if (/mobile|android|iphone|ipad/i.test(ua)) return "Mobile";
  if (/macintosh|mac os/i.test(ua)) return "Mac";
  if (/windows/i.test(ua)) return "Windows";
  if (/linux/i.test(ua)) return "Linux";
  return "Unknown";
}

/** Parses browser name from user agent string */
function parseBrowser(ua: string): string {
  if (/edg\//i.test(ua)) return "Edge";
  if (/firefox/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return "Safari";
  if (/chrome/i.test(ua)) return "Chrome";
  return "Other";
}

/** Returns the last N days as YYYY-MM-DD strings */
function getLastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

/** Returns short day label (Mon, Tue, etc.) from YYYY-MM-DD */
function dayLabel(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });
}

/** Hour labels for the 24-hour chart */
const HOUR_LABELS: Record<number, string> = {
  0: "12am",
  6: "6am",
  12: "12pm",
  18: "6pm",
  23: "11pm",
};

/**
 * Fetches all tool_usage documents from Firestore.
 */
async function fetchAllToolData(): Promise<ToolData[]> {
  const db = getFirebaseFirestore();
  const snapshot = await getDocs(collection(db, "tool_usage"));
  const tools: ToolData[] = [];

  snapshot.forEach((docSnap) => {
    const d = docSnap.data();
    tools.push({
      slug: d.slug ?? docSnap.id,
      name: d.name ?? docSnap.id,
      totalUses: d.totalUses ?? 0,
      downloads: d.downloads ?? 0,
      lastUsedAt: d.lastUsedAt ?? null,
      dailyUses: d.dailyUses ?? {},
      hourlyDist: d.hourlyDist ?? {},
      events: d.events ?? [],
    });
  });

  return tools;
}

/**
 * 7-day bar chart component — pure CSS, no chart library needed.
 */
function SevenDayChart({ tools }: { tools: ToolData[] }) {
  const days = getLastNDays(7);

  const dailyTotals = days.map((day) =>
    tools.reduce((sum, t) => sum + (t.dailyUses[day] ?? 0), 0)
  );

  const maxVal = Math.max(...dailyTotals, 1);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="mb-4 text-sm font-medium text-zinc-300">Last 7 Days</h2>
      <div className="flex items-end gap-2 h-40">
        {days.map((day, i) => {
          const val = dailyTotals[i];
          const pct = (val / maxVal) * 100;
          return (
            <div key={day} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs font-mono text-zinc-400">{val}</span>
              <div className="relative w-full flex justify-center" style={{ height: "120px" }}>
                <div
                  className="w-full max-w-[2rem] rounded-t bg-gradient-to-t from-indigo-600 to-purple-500 transition-all"
                  style={{ height: `${Math.max(pct, 2)}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-500">{dayLabel(day)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Hourly distribution mini chart for a single tool.
 */
function HourlyChart({ hourlyDist }: { hourlyDist: Record<string, number> }) {
  const maxVal = Math.max(
    ...Array.from({ length: 24 }, (_, h) => hourlyDist[h.toString()] ?? 0),
    1
  );

  return (
    <div>
      <h4 className="mb-2 text-xs font-medium text-zinc-400">Hourly Distribution</h4>
      <div className="flex items-end gap-px h-16">
        {Array.from({ length: 24 }, (_, h) => {
          const val = hourlyDist[h.toString()] ?? 0;
          const pct = (val / maxVal) * 100;
          return (
            <div key={h} className="flex flex-1 flex-col items-center">
              <div
                className="w-full rounded-t bg-indigo-500/60 transition-all min-h-[1px]"
                style={{ height: `${Math.max(pct, 2)}%` }}
                title={`${h}:00 — ${val} uses`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1">
        {[0, 6, 12, 18, 23].map((h) => (
          <span key={h} className="text-[9px] text-zinc-600">{HOUR_LABELS[h]}</span>
        ))}
      </div>
    </div>
  );
}

/**
 * Daily trend chart for a single tool (last 14 days).
 */
function DailyTrendChart({ dailyUses }: { dailyUses: Record<string, number> }) {
  const days = getLastNDays(14);
  const vals = days.map((d) => dailyUses[d] ?? 0);
  const maxVal = Math.max(...vals, 1);

  return (
    <div>
      <h4 className="mb-2 text-xs font-medium text-zinc-400">Daily Trend (14 days)</h4>
      <div className="flex items-end gap-px h-12">
        {days.map((day, i) => {
          const pct = (vals[i] / maxVal) * 100;
          return (
            <div
              key={day}
              className="flex-1 rounded-t bg-emerald-500/50 transition-all min-h-[1px]"
              style={{ height: `${Math.max(pct, 2)}%` }}
              title={`${day}: ${vals[i]}`}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * Tool detail drilldown — shown when a table row is expanded.
 */
function ToolDetail({ tool }: { tool: ToolData }) {
  const recentEvents = tool.events.slice(-30).reverse();

  const lastUsed = tool.lastUsedAt?.toDate
    ? tool.lastUsedAt.toDate().toLocaleString("en-IN")
    : "—";

  return (
    <div className="space-y-5 border-t border-white/[0.06] bg-white/[0.02] px-4 py-5">
      <p className="text-xs text-zinc-500">
        Last used: <span className="text-zinc-300">{lastUsed}</span>
      </p>

      {/* Hourly + Daily side-by-side */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <HourlyChart hourlyDist={tool.hourlyDist} />
        <DailyTrendChart dailyUses={tool.dailyUses} />
      </div>

      {/* Recent Activity Log */}
      <div>
        <h4 className="mb-2 text-xs font-medium text-zinc-400">
          Recent Activity ({recentEvents.length} events)
        </h4>
        {recentEvents.length === 0 ? (
          <p className="text-xs text-zinc-600">No events recorded yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                  <th className="px-3 py-2 font-medium text-zinc-500">Action</th>
                  <th className="px-3 py-2 font-medium text-zinc-500">Device</th>
                  <th className="px-3 py-2 font-medium text-zinc-500">Browser</th>
                  <th className="px-3 py-2 font-medium text-zinc-500">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((evt, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    <td className="px-3 py-1.5">
                      <span
                        className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          evt.action === "use"
                            ? "bg-indigo-500/20 text-indigo-400"
                            : "bg-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        {evt.action}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-zinc-400">{parseDevice(evt.ua)}</td>
                    <td className="px-3 py-1.5 text-zinc-400">{parseBrowser(evt.ua)}</td>
                    <td className="px-3 py-1.5 font-mono text-zinc-500">
                      {new Date(evt.at).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Login form for admin access — PIN is sent via POST to the server,
 * never exposed in URLs, query params, or the client bundle.
 */
function AdminLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setSubmitting(true);

      try {
        const res = await fetch("/api/admin-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin }),
        });

        if (res.ok) {
          onSuccess();
        } else {
          const data = await res.json();
          setError(data.error ?? "Authentication failed");
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [pin, onSuccess]
  );

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-white">Admin Access</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Enter your admin PIN to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter PIN"
            autoComplete="off"
            maxLength={64}
            className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 text-center font-mono text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
          />

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-center text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!pin.trim() || submitting}
            className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Verifying..." : "Unlock Dashboard"}
          </button>
        </form>

        <Link
          href="/"
          className="block text-center text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          Back to Kit
        </Link>
      </div>
    </div>
  );
}

/**
 * Admin dashboard — authenticated via server-side session cookie.
 */
export default function AdminPage() {
  const [authState, setAuthState] = useState<"checking" | "login" | "authenticated">("checking");
  const [tools, setTools] = useState<ToolData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("totalUses");
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  /** Check if existing session cookie is valid */
  useEffect(() => {
    fetch("/api/admin-auth")
      .then((res) => {
        setAuthState(res.ok ? "authenticated" : "login");
      })
      .catch(() => setAuthState("login"));
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAllToolData();
      setTools(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  /** Auto-load data once authenticated */
  useEffect(() => {
    if (authState === "authenticated") {
      loadData();
    }
  }, [authState, loadData]);

  const handleLogout = useCallback(async () => {
    await fetch("/api/admin-auth", { method: "DELETE" });
    setAuthState("login");
    setTools([]);
  }, []);

  // Summary stats
  const totalUses = tools.reduce((s, t) => s + t.totalUses, 0);
  const totalDownloads = tools.reduce((s, t) => s + t.downloads, 0);
  const activeTools = tools.filter((t) => t.totalUses > 0 || t.downloads > 0).length;

  // Sorted tools
  const sortedTools = useMemo(() => {
    return [...tools].sort((a, b) => {
      if (sortKey === "totalUses") return b.totalUses - a.totalUses;
      if (sortKey === "downloads") return b.downloads - a.downloads;
      const aTime = a.lastUsedAt?.toDate ? a.lastUsedAt.toDate().getTime() : 0;
      const bTime = b.lastUsedAt?.toDate ? b.lastUsedAt.toDate().getTime() : 0;
      return bTime - aTime;
    });
  }, [tools, sortKey]);

  /** Export all analytics data as JSON */
  const handleExport = useCallback(() => {
    const exportData = tools.map((t) => ({
      ...t,
      lastUsedAt: t.lastUsedAt?.toDate ? t.lastUsedAt.toDate().toISOString() : null,
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kit-analytics-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [tools]);

  // Loading state while checking session
  if (authState === "checking") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  // Login form
  if (authState === "login") {
    return <AdminLoginForm onSuccess={() => setAuthState("authenticated")} />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Kit Analytics</h1>
          <p className="mt-0.5 text-xs text-zinc-500">Admin Panel</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/10 disabled:opacity-40"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/10"
          >
            Logout
          </button>
          <Link
            href="/"
            className="rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/10"
          >
            Back to Kit
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5">
          <p className="text-xs text-indigo-400">Total Uses</p>
          <p className="mt-1 font-mono text-2xl font-bold text-indigo-300">
            {totalUses.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <p className="text-xs text-emerald-400">Total Downloads</p>
          <p className="mt-1 font-mono text-2xl font-bold text-emerald-300">
            {totalDownloads.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <p className="text-xs text-amber-400">Active Tools</p>
          <p className="mt-1 font-mono text-2xl font-bold text-amber-300">
            {activeTools}
          </p>
        </div>
      </div>

      {/* 7-day bar chart */}
      <div className="mb-8">
        <SevenDayChart tools={tools} />
      </div>

      {/* Per-tool table */}
      <div className="mb-6 overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03]">
              <th className="px-4 py-3 font-medium text-zinc-400">Tool Name</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Slug</th>
              <th
                className="px-4 py-3 font-medium text-zinc-400 text-right cursor-pointer select-none hover:text-white transition-colors"
                onClick={() => setSortKey("totalUses")}
              >
                Uses {sortKey === "totalUses" && "▼"}
              </th>
              <th
                className="px-4 py-3 font-medium text-zinc-400 text-right cursor-pointer select-none hover:text-white transition-colors"
                onClick={() => setSortKey("downloads")}
              >
                Downloads {sortKey === "downloads" && "▼"}
              </th>
              <th
                className="px-4 py-3 font-medium text-zinc-400 text-right cursor-pointer select-none hover:text-white transition-colors"
                onClick={() => setSortKey("lastUsedAt")}
              >
                Last Used {sortKey === "lastUsedAt" && "▼"}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTools.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  No analytics data yet. Use a tool to generate events.
                </td>
              </tr>
            )}
            {sortedTools.map((tool) => {
              const isExpanded = expandedSlug === tool.slug;
              const lastUsed = tool.lastUsedAt?.toDate
                ? tool.lastUsedAt.toDate().toLocaleString("en-IN")
                : "—";

              return (
                <tr key={tool.slug} className="group">
                  <td colSpan={5} className="p-0">
                    <button
                      onClick={() => setExpandedSlug(isExpanded ? null : tool.slug)}
                      className="flex w-full items-center border-b border-white/[0.06] text-left transition-colors hover:bg-white/[0.03]"
                    >
                      <span className="flex-1 px-4 py-3 font-medium text-white">
                        {tool.name}
                        <span className="ml-2 text-xs text-zinc-600">
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      </span>
                      <span className="w-28 px-4 py-3 font-mono text-xs text-zinc-500">
                        {tool.slug}
                      </span>
                      <span className="w-24 px-4 py-3 text-right font-mono text-indigo-400">
                        {tool.totalUses}
                      </span>
                      <span className="w-24 px-4 py-3 text-right font-mono text-emerald-400">
                        {tool.downloads}
                      </span>
                      <span className="w-36 px-4 py-3 text-right text-xs text-zinc-500">
                        {lastUsed}
                      </span>
                    </button>
                    {isExpanded && <ToolDetail tool={tool} />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Export button */}
      <button
        onClick={handleExport}
        disabled={tools.length === 0}
        className="rounded-lg border border-white/10 bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Export Raw Analytics JSON
      </button>

      {loading && (
        <div className="mt-6 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      )}
    </div>
  );
}
