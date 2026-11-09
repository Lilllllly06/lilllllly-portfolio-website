import { useEffect, useState } from "react";
import { LockKeyhole, MessageSquare, RefreshCw } from "lucide-react";
import type { readQuestionLog } from "../server/question-log";
import { dayLabel, timestamp } from "./format";

type QuestionReport = Awaited<ReturnType<typeof readQuestionLog>>;

export default function SavedQuestions() {
  const [environment, setEnvironment] = useState("production");
  const [day, setDay] = useState(0);
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{ key: string; report?: QuestionReport }>();
  const query = new URLSearchParams({ environment, day: String(day), page: String(page) });
  const url = `/api/questions?${query}`;
  const key = `${url}:${revision}`;
  const loading = result?.key !== key;
  const report = loading ? undefined : result.report;
  const refresh = () => setRevision((value) => value + 1);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort("timeout"), 8000);
    void (async () => {
      try {
        const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error();
        const data: QuestionReport = await response.json();
        if (!controller.signal.aborted) setResult({ key, report: data });
      } catch {
        if (!controller.signal.aborted || controller.signal.reason === "timeout") setResult({ key });
      } finally {
        clearTimeout(timeout);
      }
    })();
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [key, url]);

  return <main>
    <section className="page-heading"><div><p className="eyebrow">Portfolio assistant</p><h1>Saved questions</h1></div></section>
    <div className="toolbar question-toolbar">
      <div className="filters">
        <label className="sr-only" htmlFor="question-environment">Environment</label>
        <select id="question-environment" value={environment} onChange={(event) => { setEnvironment(event.target.value); setPage(1); }}>
          <option value="production">Production</option><option value="preview">Preview</option><option value="development">Development</option>
        </select>
        <label className="sr-only" htmlFor="question-day">Date (UTC)</label>
        <select id="question-day" value={day} onChange={(event) => { setDay(Number(event.target.value)); setPage(1); }}>
          {Array.from({ length: 7 }, (_, i) => <option key={i} value={i}>{i === 0 ? "Today (UTC)" : dayLabel(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10))}</option>)}
        </select>
      </div>
      <button className="icon-button" aria-label="Refresh questions" title="Refresh questions" onClick={refresh} disabled={loading}><RefreshCw size={17} className={loading ? "spin" : ""} /></button>
    </div>
    <div className="update-line" role="status">{loading ? "Loading questions..." : report ? `${dayLabel(report.date)} UTC / Times shown in Toronto time` : "Questions unavailable"}</div>
    {!loading && !report && <div className="error-banner" role="alert"><span>Could not read saved questions. Check the local Redis configuration.</span><button onClick={refresh}>Retry</button></div>}
    {report && (report.questions.length ? <ol className="question-list">
      {report.questions.map((record) => <li key={record.id}><time dateTime={record.timestamp}>{timestamp(record.timestamp)}</time><p>{record.question}</p></li>)}
    </ol> : <div className="empty-state"><MessageSquare size={22} /><h3>No saved questions</h3></div>)}
    <div className="pagination"><span>Page {page}</span><div>
      <button disabled={loading || page === 1} onClick={() => setPage(page - 1)}>Previous</button>
      <button disabled={loading || !report?.hasNext} onClick={() => setPage(page + 1)}>Next</button>
    </div></div>
    <footer><span><LockKeyhole size={13} /> Read-only <span className="separator">/</span> Up to 7 days retained</span></footer>
  </main>;
}
