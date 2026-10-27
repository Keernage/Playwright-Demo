// Minimal typings for the parts of Playwright's JSON reporter output we use.
// Full schema: https://playwright.dev/docs/test-reporters#json-reporter
interface PwAttachment {
  name: string;
  contentType: string;
  path?: string;
}

interface PwError {
  message?: string;
  stack?: string;
}

interface PwResult {
  status: 'passed' | 'failed' | 'timedOut' | 'skipped' | 'interrupted';
  duration: number;
  retry: number;
  error?: PwError;
  errors?: PwError[];
  attachments: PwAttachment[];
}

interface PwTest {
  projectName: string;
  status: 'expected' | 'unexpected' | 'flaky' | 'skipped';
  results: PwResult[];
}

interface PwSpec {
  title: string;
  file: string;
  line: number;
  tests: PwTest[];
}

interface PwSuite {
  title: string;
  file: string;
  specs?: PwSpec[];
  suites?: PwSuite[];
}

export interface PwReport {
  suites: PwSuite[];
  errors?: PwError[];
  stats: { startTime: string; duration: number };
}

export type TestStatus = 'passed' | 'failed' | 'flaky' | 'skipped';

export interface TestRow {
  id: string;
  file: string;
  title: string;
  project: string;
  status: TestStatus;
  duration: number;
  attempts: number;
  error?: string;
  screenshots: string[];
  trace?: string;
}

export interface FileSummary {
  file: string;
  counts: Record<TestStatus, number>;
  duration: number;
}

export interface RunSummary {
  startTime: Date;
  duration: number;
  total: number;
  counts: Record<TestStatus, number>;
  projects: string[];
  files: FileSummary[];
  tests: TestRow[];
  globalErrors: string[];
}

const STATUS_MAP: Record<PwTest['status'], TestStatus> = {
  expected: 'passed',
  unexpected: 'failed',
  flaky: 'flaky',
  skipped: 'skipped',
};

const emptyCounts = (): Record<TestStatus, number> => ({ passed: 0, failed: 0, flaky: 0, skipped: 0 });

// eslint-disable-next-line no-control-regex
const stripAnsi = (s: string) => s.replace(/\u001b\[[0-9;]*m/g, '');

/** Maps an absolute path inside test-results/ to the URL the Vite plugin serves it at. */
export function artifactUrl(filePath: string): string | undefined {
  const normalized = filePath.replace(/\\/g, '/');
  const idx = normalized.toLowerCase().lastIndexOf('/test-results/');
  if (idx === -1) return undefined;
  const rel = normalized.slice(idx + '/test-results/'.length);
  return '/__artifacts/' + rel.split('/').map(encodeURIComponent).join('/');
}

function collect(suite: PwSuite, parents: string[], out: TestRow[]): void {
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests) {
      const last = test.results[test.results.length - 1];
      const failing = test.results.filter((r) => r.status !== 'passed' && r.status !== 'skipped');
      const errorSource = failing[failing.length - 1];
      const message = errorSource?.errors?.map((e) => e.message ?? '').join('\n\n') || errorSource?.error?.message;
      const attachments = (errorSource ?? last)?.attachments ?? [];

      out.push({
        id: `${spec.file}:${spec.line}:${test.projectName}:${[...parents, spec.title].join('>')}`,
        file: spec.file,
        title: [...parents, spec.title].join(' › '),
        project: test.projectName,
        status: STATUS_MAP[test.status],
        duration: test.results.reduce((sum, r) => sum + r.duration, 0),
        attempts: test.results.length,
        error: message ? stripAnsi(message) : undefined,
        screenshots: attachments
          .filter((a) => a.contentType.startsWith('image/') && a.path)
          .map((a) => artifactUrl(a.path!))
          .filter((u): u is string => !!u),
        trace: attachments.filter((a) => a.name === 'trace' && a.path).map((a) => artifactUrl(a.path!))[0],
      });
    }
  }
  for (const child of suite.suites ?? []) {
    collect(child, [...parents, child.title], out);
  }
}

export function summarize(report: PwReport): RunSummary {
  const tests: TestRow[] = [];
  // Top-level suites are files; nested suites are describe() blocks.
  for (const fileSuite of report.suites) collect(fileSuite, [], tests);

  const counts = emptyCounts();
  const byFile = new Map<string, FileSummary>();
  for (const t of tests) {
    counts[t.status]++;
    const f = byFile.get(t.file) ?? { file: t.file, counts: emptyCounts(), duration: 0 };
    f.counts[t.status]++;
    f.duration += t.duration;
    byFile.set(t.file, f);
  }

  return {
    startTime: new Date(report.stats.startTime),
    duration: report.stats.duration,
    total: tests.length,
    counts,
    projects: [...new Set(tests.map((t) => t.project))],
    files: [...byFile.values()].sort((a, b) => a.file.localeCompare(b.file)),
    tests,
    globalErrors: (report.errors ?? []).map((e) => stripAnsi(e.message ?? String(e))),
  };
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)} s`;
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
}
