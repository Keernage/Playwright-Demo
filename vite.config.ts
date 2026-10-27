import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import type { Connect, Plugin } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.webm': 'video/webm',
  '.zip': 'application/zip',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

/** Serves files from `dir` under `prefix`, refusing anything that escapes `dir`. */
function staticDir(prefix: string, dir: string): Connect.NextHandleFunction {
  const root = path.resolve(dir);
  return (req, res, next) => {
    const url = req.url ?? '';
    if (!url.startsWith(prefix)) return next();
    let rel = decodeURIComponent(url.slice(prefix.length).split('?')[0]);
    if (rel === '' || rel.endsWith('/')) rel += 'index.html';
    const file = path.resolve(root, rel);
    if (!file.startsWith(root + path.sep) || !existsSync(file) || !statSync(file).isFile()) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }
    res.setHeader('Content-Type', MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    createReadStream(file).pipe(res);
  };
}

/**
 * Exposes Playwright output to the dashboard without copying it into `public/`
 * (which would trigger reloads mid-run):
 *   /__reports/   -> reports/      (results.json + HTML report)
 *   /__artifacts/ -> test-results/ (failure screenshots, traces)
 */
function playwrightReports(): Plugin {
  const install = (middlewares: Connect.Server) => {
    middlewares.use(staticDir('/__reports/', 'reports'));
    middlewares.use(staticDir('/__artifacts/', 'test-results'));
  };
  return {
    name: 'playwright-reports',
    configureServer: (server) => install(server.middlewares),
    configurePreviewServer: (server) => install(server.middlewares),
  };
}

export default defineConfig({
  plugins: [react(), playwrightReports()],
  server: {
    watch: { ignored: ['**/reports/**', '**/test-results/**'] },
  },
});
