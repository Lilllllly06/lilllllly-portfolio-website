import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Activity, ArrowDownToLine, ArrowUpRight, Check, ChevronDown, Clock3, Copy, Dog, LockKeyhole, Moon, RefreshCw, Search, Sun, X } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "next-themes";
import { dayLabel, duration, eventsCsv, filterEvents, number, timestamp, type UsageEvent, type UsageReport } from "./format";

function CopyId({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);
  return <span className="copy-id"><code>{value}</code><button type="button" className="icon-button" title={failed ? "Copy unavailable" : copied ? "Copied" : "Copy ID"} aria-label="Copy ID" onClick={async () => {
    try { await navigator.clipboard.writeText(value); setCopied(true); setFailed(false); }
    catch { setFailed(true); }
  }}>{copied ? <Check size={15} /> : <Copy size={15} />}</button><span className="sr-only" role="status">{copied ? "Copied" : failed ? "Copy unavailable. Select the ID to copy it." : ""}</span></span>;
}

function RequestDetail({ event }: { event: UsageEvent }) {
  return <dl className="request-detail">
    <div><dt>Model</dt><dd>{event.model}</dd></div>
    <div><dt>Provider</dt><dd>{event.provider}</dd></div>
    <div><dt>Input / output tokens</dt><dd>{event.usage ? `${number(event.usage.inputTokens)} / ${number(event.usage.outputTokens)}` : "Not reported"}</dd></div>
    <div><dt>Cached input</dt><dd>{event.usage?.cachedInputTokens == null ? "Not reported" : number(event.usage.cachedInputTokens)}</dd></div>
    <div className="detail-wide"><dt>Response ID</dt><dd>{event.responseId ? <CopyId value={event.responseId} /> : "Not reported"}</dd></div>
    <div className="detail-wide"><dt>Request ID</dt><dd><CopyId value={event.id} /></dd></div>
  </dl>;
}

export default function Dashboard() {
  const [days, setDays] = useState(7);
  const [environment, setEnvironment] = useState("production");
  const [report, setReport] = useState<UsageReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [auto, setAuto] = useState(false);
  const [search, setSearch] = useState("");
  const [outcome, setOutcome] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const controller = useRef<AbortController | null>(null);
  const { resolvedTheme, setTheme } = useTheme();

  const refresh = useCallback(async () => {
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    const timeout = setTimeout(() => request.abort("timeout"), 10000);
    setLoading(true);
    setError("");
    try {
      const result = await fetch(`/api/usage?days=${days}&environment=${environment}`, { signal: request.signal, cache: "no-store" });
      if (!result.ok) throw new Error("Could not read usage. Check your connection and local Redis configuration, then try again.");
      const data: UsageReport = await result.json();
      if (!request.signal.aborted) setReport(data);
    } catch (reason) {
      if (!request.signal.aborted || request.signal.reason === "timeout") setError(reason instanceof Error && !request.signal.aborted ? reason.message : "The request timed out. Try again.");
    } finally {
      clearTimeout(timeout);
      if (controller.current === request) setLoading(false);
    }
  }, [days, environment]);

  useEffect(() => {
    setReport(null);
    setExpanded(null);
    setPage(1);
    void refresh();
    return () => controller.current?.abort();
  }, [refresh]);
  useEffect(() => {
    if (!auto) return;
    const timer = setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, 60000);
    return () => clearInterval(timer);
  }, [auto, refresh]);
  useEffect(() => { setPage(1); setExpanded(null); }, [search, outcome]);

  const filtered = useMemo(() => filterEvents(report?.events ?? [], search, outcome), [report, search, outcome]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * 10, currentPage * 10);
  const chart = useMemo(() => [...(report?.daily ?? [])].reverse().map((row) => ({ ...row, other: row.requests - row.completed })), [report]);
  const latest = report?.events[0];
  const totals = report?.totals;
  const dark = resolvedTheme === "dark";
  const metric = (value: number | undefined) => value === undefined ? "\u2014" : number(value);
  const download = () => {
    const blob = new Blob([eventsCsv(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lily-agent-${environment}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return <>
    <header className="topbar"><a className="brand" href="/"><Dog size={27} strokeWidth={1.6} /><span>Lily <span className="brand-divider">/</span> <strong>Agent activity</strong></span></a>
      <div className="top-actions"><span className="local-badge"><LockKeyhole size={13} /> Local only</span><button className="icon-button" title={dark ? "Light mode" : "Dark mode"} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} onClick={() => setTheme(dark ? "light" : "dark")}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button></div></header>
    <main>
      <section className="page-heading"><div><p className="eyebrow">Portfolio assistant</p><h1>Usage overview</h1><p className="subtle">Requests and reported tokens. No conversations stored.</p></div>
        <a className="site-link" href="https://www.yuezhen-dong.com" target="_blank" rel="noreferrer">Open portfolio <ArrowUpRight size={15} /></a></section>
      <div className="toolbar">
        <div className="filters"><label className="sr-only" htmlFor="environment">Environment</label><select id="environment" value={environment} onChange={(event) => setEnvironment(event.target.value)}><option value="production">Production</option><option value="preview">Preview</option><option value="development">Development</option></select>
          <div className="segments" role="group" aria-label="Date range">{[[1, "Today"], [7, "7 days"], [30, "30 days"]].map(([value, label]) => <button type="button" key={value} aria-pressed={days === value} onClick={() => setDays(Number(value))}>{label}</button>)}</div></div>
        <div className="refresh-controls"><label className="auto-refresh"><input type="checkbox" checked={auto} onChange={(event) => setAuto(event.target.checked)} /> Auto-refresh <span>1m</span></label><button className="icon-button" title="Refresh activity" aria-label="Refresh activity" disabled={loading} onClick={() => void refresh()}><RefreshCw size={17} className={loading ? "spin" : ""} /></button></div>
      </div>
      <div className="update-line" role="status">{loading ? "Loading activity..." : error ? "Update unavailable" : report ? `Updated ${timestamp(report.generatedAt)} (Toronto)` : ""}</div>
      {error && <div className="error-banner" role="alert"><span>{error} {report ? "Showing the last successful update." : ""}</span><button onClick={() => void refresh()} disabled={loading}>Retry</button></div>}
      <section className="metrics" aria-label="Usage totals" aria-busy={loading}>
        <div><p>Model requests</p><strong>{metric(totals?.requests)}</strong><span>Not unique visitors</span></div>
        <div><p>Completed</p><strong>{metric(totals?.completed)}</strong><span>{totals ? totals.requests ? `${(totals.completed / totals.requests * 100).toFixed(1)}% of requests` : "No requests in this range" : loading ? "Awaiting data" : "Unavailable"}</span></div>
        <div><p>Reported tokens</p><strong>{metric(totals?.totalTokens)}</strong><span>{totals ? `${number(totals.requests - totals.usageKnown)} requests without token counts` : "Input + output"}</span></div>
        <div className="last-active"><p>Last request</p><strong>{latest ? new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", hour: "numeric", minute: "2-digit" }).format(new Date(latest.timestamp)) : "\u2014"}</strong><span>{latest ? timestamp(latest.timestamp).split(",")[0] + " (Toronto)" : report ? "No activity in this range" : loading ? "Awaiting data" : "Unavailable"}</span></div>
      </section>
      <section className="activity-section"><div className="section-heading"><div><h2>Daily activity</h2><p className="subtle">{chart.length === 1 ? dayLabel(chart[0].date) : chart.length ? `${dayLabel(chart[0].date)} - ${dayLabel(chart[chart.length - 1].date)}` : "Selected range"} <span className="separator">/</span> UTC days</p></div><div className="legend"><span><i className="legend-completed" /> Completed</span><span><i className="legend-other" /> Other outcomes</span></div></div>
        <div className="chart-wrap" aria-label="Daily requests chart">
          {report ? <ResponsiveContainer width="100%" height="100%"><BarChart data={chart} accessibilityLayer margin={{ left: -24, right: 4, top: 12, bottom: 0 }} barCategoryGap="35%">
            <CartesianGrid vertical={false} stroke="var(--line)" />
            <XAxis dataKey="date" tickFormatter={dayLabel} axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} minTickGap={32} dy={8} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} domain={[0, (max: number) => Math.max(1, max)]} />
            <Tooltip cursor={{ fill: "var(--hover)" }} labelFormatter={dayLabel} contentStyle={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 6, color: "var(--ink)", fontSize: 12 }} />
            <Bar name="Completed" dataKey="completed" stackId="requests" fill="var(--blue)" maxBarSize={36} isAnimationActive={false} />
            <Bar name="Other outcomes" dataKey="other" stackId="requests" fill="var(--other)" maxBarSize={36} isAnimationActive={false} />
          </BarChart></ResponsiveContainer> : <div className="chart-placeholder"><Activity size={22} /><span>{loading ? "Loading daily activity" : "Daily activity unavailable"}</span></div>}
        </div>
      </section>
      <section className="requests-section"><div className="section-heading"><div><h2>Recent requests</h2><p className="subtle">{report ? `${report.events.length} retained request${report.events.length === 1 ? "" : "s"} (latest 100)` : "Latest retained requests"} <span className="separator">/</span> Toronto time</p></div><button className="export-button" disabled={!filtered.length} onClick={download}><ArrowDownToLine size={15} /> Export CSV</button></div>
        <div className="request-filters"><div className="search-field"><Search size={16} /><input aria-label="Search requests" placeholder="Search model or response ID" value={search} onChange={(event) => setSearch(event.target.value)} />{search && <button className="icon-button" title="Clear search" aria-label="Clear search" onClick={() => setSearch("")}><X size={14} /></button>}</div><label className="sr-only" htmlFor="outcome">Outcome</label><select id="outcome" value={outcome} onChange={(event) => setOutcome(event.target.value)}>{["all", "completed", "failed", "incomplete", "timeout", "cancelled"].map((value) => <option key={value} value={value}>{value === "all" ? "All outcomes" : value[0].toUpperCase() + value.slice(1)}</option>)}</select></div>
        <div className="table-scroll"><table><thead><tr><th>Started</th><th>Outcome</th><th className="model-column">Model</th><th className="numeric">Tokens</th><th className="numeric duration-column">Duration</th><th><span className="sr-only">Details</span></th></tr></thead><tbody>
          {visible.map((event) => <Fragment key={event.id}><tr className={expanded === event.id ? "selected-row" : ""}><td><time dateTime={event.timestamp}>{timestamp(event.timestamp)}</time></td><td><span className={`status status-${event.outcome}`}>{event.outcome === "completed" ? <Check size={12} /> : <Clock3 size={12} />}{event.outcome}</span></td><td className="model-column"><span className="model-name">{event.model}</span></td><td className="numeric">{event.usage ? number(event.usage.totalTokens) : <span className="subtle">Unknown</span>}</td><td className="numeric duration-column">{duration(event.durationMs)}</td><td><button className="icon-button" title="Request details" aria-label={`Request details: ${timestamp(event.timestamp)}`} aria-expanded={expanded === event.id} aria-controls={`details-${event.id}`} onClick={() => setExpanded(expanded === event.id ? null : event.id)}><ChevronDown size={16} className={expanded === event.id ? "flipped" : ""} /></button></td></tr>{expanded === event.id && <tr id={`details-${event.id}`}><td colSpan={6} className="details-cell"><RequestDetail event={event} /></td></tr>}</Fragment>)}
        </tbody></table></div>
        {!visible.length && <div className="empty-state"><Activity size={24} /><h3>{loading ? "Loading requests" : error && !report ? "Request history unavailable" : report?.events.length ? "No matching requests" : "No requests in this range"}</h3><p>{report?.events.length ? "Try another model, response ID, or outcome." : "Records appear after the assistant handles a model request."}</p>{(search || outcome !== "all") && <button onClick={() => { setSearch(""); setOutcome("all"); }}>Clear filters</button>}</div>}
        <div className="pagination"><span>{filtered.length ? `${(currentPage - 1) * 10 + 1}-${Math.min(currentPage * 10, filtered.length)} of ${filtered.length}` : "0 records"}</span><div><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button><span>{currentPage} / {totalPages}</span><button disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Next</button></div></div>
      </section>
      <footer><span><LockKeyhole size={13} /> Read-only <span className="separator">/</span> Up to 30 days retained</span><span>Page views and notes-only answers are not counted. Records can be missing if logging fails.</span></footer>
    </main>
  </>;
}
