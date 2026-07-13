#!/usr/bin/env node
/**
 * Enforces max line count for frontend UI source files.
 * Usage: node scripts/check-ui-file-length.mjs [--max 250]
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const DEFAULT_MAX = 250;
const maxArg = process.argv.find((a) => a.startsWith('--max='));
const MAX_LINES = maxArg ? Number(maxArg.split('=')[1]) : DEFAULT_MAX;

const UI_ROOTS = [
  'src/features',
  'src/layouts',
  'src/components/ui',
];

const EXCLUDE_PATTERNS = [
  /\.test\.tsx?$/,
  /\.types\.ts$/,
  /languages\/translations\.ts$/,
  /\/services\//,
  /\/mocks\//,
  /\/hooks\//,
];

async function walk(dir, files = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, files);
    } else if (entry.isFile() && /\.tsx$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function isExcluded(filePath) {
  const rel = path.relative(root, filePath).replace(/\\/g, '/');
  return EXCLUDE_PATTERNS.some((re) => re.test(rel));
}

async function main() {
  const offenders = [];

  for (const relRoot of UI_ROOTS) {
    const absRoot = path.join(root, relRoot);
    try {
      await stat(absRoot);
    } catch {
      continue;
    }
    const files = await walk(absRoot);
    for (const file of files) {
      if (isExcluded(file)) continue;
      const content = await readFile(file, 'utf8');
      const lines = content.split(/\r?\n/).length;
      if (lines > MAX_LINES) {
        offenders.push({ file: path.relative(root, file).replace(/\\/g, '/'), lines });
      }
    }
  }

  if (offenders.length === 0) {
    console.log(`UI file length check passed (max ${MAX_LINES} lines).`);
    process.exit(0);
  }

  console.error(`UI file length check failed (max ${MAX_LINES} lines):\n`);
  for (const { file, lines } of offenders.sort((a, b) => b.lines - a.lines)) {
    console.error(`  ${lines}  ${file}`);
  }
  console.error(`\nSplit large UI files into smaller components under the same feature folder.`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
