import { useCallback, useEffect, useMemo, useState } from 'react';
import { type FileSummary, type PwReport, type RunSummary, type TestRow, type TestStatus, formatDuration, summarize } from './parseReport';

const REPORT_URL = '/__reports/results.json';
const HTML_REPORT_URL = '/__reports/html/index.html';

const STATUS_META: Record<TestStatus, { label: string; icon: string }> = {
  passed: { label: 'Passed', icon: '✓' },
  failed: { label: 'Failed', icon: '✕' },
  flaky: { label: 'Flaky', icon: '↻' },
  skipped: { label: 'Skipped', icon: '–' },
};
const STATUS_ORDER: TestStatus[] = ['passed', 'failed', 'flaky', 'skipped'];
// The test list surfaces problems first.
const SORT_RANK: Record<TestStatus, number> = { failed: 0, flaky: 1, passed: 2, skipped: 3 };

type LoadState = { kind: 'loading' } | { kind: 'empty' } | { kind: 'error'; message: string } | { kind: 'ready'; run: RunSummary };

export function Dashboard() {
  const [state, setState] = useState<LoadState>({ kind: 'loading' });

  const load = useCallback(async () => {
    setState({ kind: 'loading' });
    try {
      const res = await fetch(REPORT_URL, { cache: 'no-store' });
      if (res.status === 404) return setState({ kind: 'empty' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setState({ kind: 'ready', run: summarize((await res.json()) as PwReport) });
    } catch (err) {
      setState({ kind: 'error', message: err instanceof Error ? err.message : String(err) });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="dashboard" data-testid="dashboard">
      <div className="page-head">
        <div>
          <h1>Test run dashboard</h1>
          <p className="muted">
            End-to-end results for the <a className="link" href="#/store/login">ShopLite demo store</a>, read from
            Playwright's JSON reporter.
          </p>
        </div>
        <div className="head-actions">
          <button type="button" className="btn btn-ghost" onClick={() => void load()} data-testid="refresh-results">
            Refresh
          </button>
          {state.kind === 'ready' && (
            <a className="btn btn-primary" href={HTML_REPORT_URL} target="_blank" rel="noreferrer">
              Full HTML report ↗
            </a>
          )}
        </div>
      </div>

      {state.kind === 'loading' && <div className="empty">Loading results…</div>}
      {state.kind === 'error' && (
        <div className="alert alert-error" role="alert">
          Could not read <code>{REPORT_URL}</code>: {state.message}
        </div>
      )}
      {state.kind === 'empty' && <EmptyState />}
      {state.kind === 'ready' && <RunView run={state.run} />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card empty-state" data-testid="dashboard-empty">
      <h2>No test results yet</h2>
      <p className="muted">Run the suite and refresh this page:</p>
      <pre className="code">npm test</pre>
      <p className="muted small">
        Results are written to <code>reports/results.json</code> and served at <code>{REPORT_URL}</code>.
      </p>
    </div>
  );
}

function RunView({ run }: { run: RunSummary }) {
  const failing = run.counts.failed;
  const executed = run.total - run.counts.skipped;
  const passRate = executed ? ((run.counts.passed + run.counts.flaky) / executed) * 100 : 0;

  return (
    <>
      <div className={`run-banner ${failing ? 'is-failed' : 'is-passed'}`} data-testid="run-status">
        <span className="status-icon" aria-hidden="true">
          {failing ? '✕' : '✓'}
        </span>
        <div>
          <strong>{failing ? `${failing} failing ${failing === 1 ? 'test' : 'tests'}` : 'All tests passing'}</strong>
          <span className="muted small">
            {' '}
            · run started {run.startTime.toLocaleString()} · projects: {run.projects.join(', ')}
          </span>
        </div>
      </div>

      {run.globalErrors.length > 0 && (
        <div className="alert alert-error" role="alert">
          {run.globalErrors.map((e, i) => (
            <pre key={i} className="error-text">
              {e}
            </pre>
          ))}
        </div>
      )}

      <div className="stat-grid">
        <Stat label="Total tests" value={String(run.total)} testId="stat-total" />
        <Stat label="Passed" value={String(run.counts.passed)} status="passed" testId="stat-passed" />
        <Stat label="Failed" value={String(run.counts.failed)} status="failed" testId="stat-failed" />
        <Stat label="Flaky / skipped" value={`${run.counts.flaky} / ${run.counts.skipped}`} testId="stat-other" />
        <Stat label="Pass rate" value={`${passRate.toFixed(passRate % 1 ? 1 : 0)}%`} testId="stat-pass-rate" />
        <Stat label="Wall-clock duration" value={formatDuration(run.duration)} testId="stat-duration" />
      </div>

      <section className="card">
        <h2 className="section-title">Result breakdown</h2>
        <StackedBar counts={run.counts} total={run.total} large />
        <Legend counts={run.counts} />
      </section>

      <section className="card">
        <h2 className="section-title">By spec file</h2>
        <FileTable files={run.files} />
      </section>

      <section className="card">
        <TestList tests={run.tests} />
      </section>
    </>
  );
}

function Stat({ label, value, status, testId }: { label: string; value: string; status?: TestStatus; testId: string }) {
  return (
    <div className="stat" data-testid={testId}>
      <span className="stat-label">
        {status && <span className={`dot dot-${status}`} aria-hidden="true" />}
        {label}
      </span>
      <span className="stat-value">{value}</span>
    </div>
  );
}

function StackedBar({ counts, total, large }: { counts: Record<TestStatus, number>; total: number; large?: boolean }) {
  if (!total) return <div className={`bar ${large ? 'bar-lg' : ''}`} />;
  return (
    <div className={`bar ${large ? 'bar-lg' : ''}`} role="img" aria-label={STATUS_ORDER.map((s) => `${counts[s]} ${s}`).join(', ')}>
      {STATUS_ORDER.filter((s) => counts[s] > 0).map((s) => (
        <span
          key={s}
          className={`bar-seg seg-${s}`}
          style={{ flexGrow: counts[s] }}
          title={`${STATUS_META[s].label}: ${counts[s]} (${((counts[s] / total) * 100).toFixed(0)}%)`}
        />
      ))}
    </div>
  );
}

function Legend({ counts }: { counts: Record<TestStatus, number> }) {
  return (
    <ul className="legend">
      {STATUS_ORDER.map((s) => (
        <li key={s}>
          <span className={`dot dot-${s}`} aria-hidden="true" />
          {STATUS_META[s].label} <strong>{counts[s]}</strong>
        </li>
      ))}
    </ul>
  );
}

function FileTable({ files }: { files: FileSummary[] }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Spec</th>
            <th scope="col" className="num">Passed</th>
            <th scope="col" className="num">Failed</th>
            <th scope="col" className="num hide-sm">Skipped</th>
            <th scope="col" className="num">Time</th>
            <th scope="col" className="hide-sm">Breakdown</th>
          </tr>
        </thead>
        <tbody>
          {files.map((f) => {
            const total = STATUS_ORDER.reduce((n, s) => n + f.counts[s], 0);
            return (
              <tr key={f.file} data-testid="file-row">
                <td className="mono">{f.file}</td>
                <td className="num">{f.counts.passed + f.counts.flaky}</td>
                <td className={`num ${f.counts.failed ? 'text-failed' : ''}`}>{f.counts.failed}</td>
                <td className="num hide-sm">{f.counts.skipped}</td>
                <td className="num">{formatDuration(f.duration)}</td>
                <td className="hide-sm bar-cell">
                  <StackedBar counts={f.counts} total={total} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

type Filter = 'all' | TestStatus;

function TestList({ tests }: { tests: TestRow[] }) {
  const hasFailures = tests.some((t) => t.status === 'failed');
  const [filter, setFilter] = useState<Filter>(hasFailures ? 'failed' : 'all');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tests
      .filter((t) => filter === 'all' || t.status === filter)
      .filter((t) => !q || `${t.file} ${t.title} ${t.project}`.toLowerCase().includes(q))
      .sort((a, b) => SORT_RANK[a.status] - SORT_RANK[b.status] || a.file.localeCompare(b.file));
  }, [tests, filter, query]);

  const countFor = (f: Filter) => (f === 'all' ? tests.length : tests.filter((t) => t.status === f).length);

  return (
    <>
      <div className="list-head">
        <h2 className="section-title">Tests</h2>
        <div className="filters" role="group" aria-label="Filter by status">
          {(['all', ...STATUS_ORDER] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              className={`filter-chip ${filter === f ? 'active' : ''}`}
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : STATUS_META[f].label} <span className="count">{countFor(f)}</span>
            </button>
          ))}
        </div>
        <input
          type="search"
          className="search search-sm"
          placeholder="Filter tests…"
          aria-label="Filter tests by name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {visible.length === 0 ? (
        <p className="muted">No tests match this filter.</p>
      ) : (
        <ul className="test-list">
          {visible.map((t) => (
            <TestItem key={t.id} test={t} />
          ))}
        </ul>
      )}
    </>
  );
}

function TestItem({ test }: { test: TestRow }) {
  const meta = STATUS_META[test.status];
  const summary = (
    <>
      <span className={`badge badge-${test.status}`}>
        <span aria-hidden="true">{meta.icon}</span> {meta.label}
      </span>
      <span className="test-title">
        <span className="mono small muted">{test.file}</span>
        <span>{test.title}</span>
      </span>
      <span className="test-meta">
        <span className="chip">{test.project}</span>
        <span className="mono small">{formatDuration(test.duration)}</span>
      </span>
    </>
  );

  if (!test.error && test.screenshots.length === 0) {
    return (
      <li className="test-item" data-testid="test-row" data-status={test.status}>
        <div className="test-summary">{summary}</div>
      </li>
    );
  }

  return (
    <li className="test-item" data-testid="test-row" data-status={test.status}>
      <details open={test.status === 'failed'}>
        <summary className="test-summary">{summary}</summary>
        <div className="failure">
          {test.attempts > 1 && <p className="small muted">Attempts: {test.attempts}</p>}
          {test.error && <pre className="error-text" data-testid="failure-message">{test.error}</pre>}
          {test.screenshots.length > 0 && (
            <div className="shots">
              {test.screenshots.map((src) => (
                <a key={src} href={src} target="_blank" rel="noreferrer">
                  <img src={src} alt={`Screenshot at failure: ${test.title}`} loading="lazy" data-testid="failure-screenshot" />
                </a>
              ))}
            </div>
          )}
          {test.trace && (
            <p className="small">
              Trace: <a className="link" href={test.trace}>download trace.zip</a> and open it with{' '}
              <code>npx playwright show-trace</code> or at trace.playwright.dev.
            </p>
          )}
        </div>
      </details>
    </li>
  );
}
