import type { readUsageReport } from "../server/usage";

export type UsageReport = Awaited<ReturnType<typeof readUsageReport>>;
export type UsageEvent = UsageReport["events"][number];
export const number = (value: number) => value.toLocaleString("en-CA");
export const timeZone = "America/Toronto";
export const timestamp = (value: string) => new Intl.DateTimeFormat("en-CA", {
  timeZone, month: "short", day: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit",
}).format(new Date(value));
export const dayLabel = (value: string) => new Intl.DateTimeFormat("en-CA", {
  timeZone: "UTC", month: "short", day: "numeric",
}).format(new Date(`${value}T12:00:00Z`));
export const duration = (value: number) => `${(value / 1000).toFixed(2)} s`;

export function filterEvents(events: UsageEvent[], search: string, outcome: string) {
  const query = search.trim().toLowerCase();
  return events.filter((event) => (outcome === "all" || event.outcome === outcome) &&
    [event.model, event.responseId ?? "", event.id, timestamp(event.timestamp)].some((value) => value.toLowerCase().includes(query)));
}

export function eventsCsv(events: UsageEvent[]) {
  const cell = (value: string | number | null) => {
    let text = value === null ? "" : String(value);
    if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  const rows = [
    ["Started (UTC)", "Finished (UTC)", "Outcome", "Provider", "Model", "Input tokens", "Output tokens", "Total tokens", "Cached input tokens", "Duration (ms)", "Response ID", "Request ID"],
    ...events.map((event) => [event.timestamp, event.finishedAt, event.outcome, event.provider, event.model,
      event.usage?.inputTokens ?? null, event.usage?.outputTokens ?? null, event.usage?.totalTokens ?? null,
      event.usage?.cachedInputTokens ?? null, event.durationMs, event.responseId, event.id]),
  ];
  return rows.map((row) => row.map(cell).join(",")).join("\r\n");
}
