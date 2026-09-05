import { describe, expect, it } from 'vitest';
const legacyColor = /(?:bg|text|border)-(?:neutral|zinc|gray|slate)-\d+/g;
const overlay = /bg-white\/\[[0-9.]+\]/g;
const overlayDebt = new Set([
  'src/layouts/DashboardLayout.tsx',
  'src/layouts/EmployerDashboardLayout.tsx',
  'src/layouts/AdminDashboardLayout.tsx',
  'src/components/ui/section-panel.tsx',
  'src/components/patterns/flow-wizard/FlowWizardNav.tsx',
  // Existing flat decorative surfaces; state-bearing overlays are migrated in UX2-F3.
]);

const sourceFiles = import.meta.glob('/src/**/*.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

describe('light theme regression guard', () => {
  it('reports every legacy dark class with its file and line', () => {
    const violations = Object.entries(sourceFiles).flatMap(([file, source]) => {
      const rel = file.replace(/^\//, '');
      return source.split('\n').flatMap((line, index) =>
        line.match(legacyColor) ? [`${rel}:${index + 1}: ${line.trim()}`] : [],
      );
    });
    expect(violations, violations.join('\n')).toEqual([]);
  }, 30_000);

  it('keeps white overlay debt finite and documented', () => {
    const violations = Object.entries(sourceFiles).flatMap(([file, source]) => {
      const rel = file.replace(/^\//, '');
      if (!overlayDebt.has(rel)) return [];
      return source.match(overlay) ?? [];
    });
    expect(overlayDebt.size).toBeGreaterThan(0);
    expect(violations.length).toBeGreaterThan(0);
  });
});
