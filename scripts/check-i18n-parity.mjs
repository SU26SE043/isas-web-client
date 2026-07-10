#!/usr/bin/env node
/**
 * Ensures every translation file has matching vi/en keys.
 * Usage: node scripts/check-i18n-parity.mjs
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const srcRoot = path.join(root, 'src');

async function walk(dir, files = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, files);
    } else if (entry.isFile() && entry.name === 'translations.ts' && full.includes(`${path.sep}languages${path.sep}`)) {
      files.push(full);
    }
  }
  return files;
}

function keysInLang(content, lang) {
  const marker = `${lang}: {`;
  const start = content.indexOf(marker);
  if (start === -1) return null;

  const endMarker = lang === 'vi' ? 'en: {' : '};';
  const end = content.indexOf(endMarker, start + marker.length);
  if (end === -1) return null;

  const section = content.slice(start, end);
  return [...section.matchAll(/'([^']+)'\s*:/g)].map((match) => match[1]);
}

function diffKeys(left, right) {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  return {
    missingInRight: [...leftSet].filter((key) => !rightSet.has(key)).sort(),
    missingInLeft: [...rightSet].filter((key) => !leftSet.has(key)).sort(),
  };
}

async function main() {
  try {
    await stat(srcRoot);
  } catch {
    console.error('src/ directory not found.');
    process.exit(1);
  }

  const files = await walk(srcRoot);
  const failures = [];
  let checked = 0;

  for (const file of files) {
    const rel = path.relative(root, file).replace(/\\/g, '/');
    const content = await readFile(file, 'utf8');
    const viKeys = keysInLang(content, 'vi');
    const enKeys = keysInLang(content, 'en');

    if (viKeys === null || enKeys === null) {
      continue;
    }

    checked += 1;
    const { missingInRight, missingInLeft } = diffKeys(viKeys, enKeys);

    if (missingInRight.length > 0 || missingInLeft.length > 0) {
      failures.push({ file: rel, missingInEn: missingInRight, missingInVi: missingInLeft });
    }
  }

  if (failures.length === 0) {
    console.log(`i18n parity check passed (${checked} translation files).`);
    process.exit(0);
  }

  console.error('i18n parity check failed:\n');
  for (const failure of failures) {
    console.error(`  ${failure.file}`);
    if (failure.missingInEn?.length) {
      console.error(`    missing in en (${failure.missingInEn.length}): ${failure.missingInEn.join(', ')}`);
    }
    if (failure.missingInVi?.length) {
      console.error(`    missing in vi (${failure.missingInVi.length}): ${failure.missingInVi.join(', ')}`);
    }
  }
  console.error('\nAdd matching keys to both vi and en in each feature languages/translations.ts file.');
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
