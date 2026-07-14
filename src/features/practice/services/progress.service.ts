import { mockDelay, usesMockData } from '@/shared/mock';
import { buildProgressAnalyticsDashboard } from '../mocks/progress.fixtures';
import type {
  ProgressDashboardQuery,
  ProgressExportKind,
  ProgressAnalyticsDashboard,
} from '../types/progress.types';

function downloadBlob(filename: string, content: string, mime = 'application/json') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export const progressService = {
  async getDashboard(query: ProgressDashboardQuery = {}): Promise<ProgressAnalyticsDashboard> {
    if (!usesMockData('practice')) {
      throw new Error('Progress API is not wired yet. Keep usesMockData("practice") true.');
    }
    await mockDelay(350);
    return buildProgressAnalyticsDashboard(query.domain ?? 'all', query.range ?? '30d');
  },

  async exportReport(kind: ProgressExportKind, dashboard: ProgressAnalyticsDashboard): Promise<void> {
    if (!usesMockData('practice')) {
      throw new Error('Progress export API is not wired yet.');
    }
    await mockDelay(200);
    const payload = {
      kind,
      exportedAt: new Date().toISOString(),
      note: 'Stub export — replace with server PDF when Progress API is live.',
      filter: { domain: dashboard.domainFilter, range: dashboard.rangeFilter },
      overall: dashboard.overall,
      readiness: dashboard.readiness,
      skills: dashboard.skills,
      roadmaps: dashboard.roadmaps,
    };
    downloadBlob(`isas-${kind}-report.json`, JSON.stringify(payload, null, 2));
  },
};
