import '@testing-library/jest-dom/vitest';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CvAnalysisReportDetail } from './components/report/CvAnalysisReportDetail';
import { CvAnalysisListSkeleton, CvAnalysisDetailSkeleton } from './components/report/CvAnalysisReportSkeleton';
import { CvAnalysisAccordionItem } from './components/report/CvAnalysisAccordionItem';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ language: 'en', t: (key: string) => key }) }));
vi.mock('@/features/cv-analysis/hooks/useCvAnalysisDetail', () => ({ useCvAnalysisDetail: () => ({ isLoading: false, isError: false, data: null, refetch: vi.fn() }) }));
vi.mock('@/features/cv-analysis/hooks/useInterviewFiles', () => ({ useInterviewFiles: () => ({ files: [] }) }));
vi.mock('./CvReportSourceActions', () => ({ CvReportSourceActions: () => null }));
vi.mock('./CvEvidenceInsights', () => ({ CvEvidenceInsights: () => null }));
vi.mock('./JDMatchCard', () => ({ JDMatchCard: () => <div /> }));
vi.mock('./SuggestionCard', () => ({ SuggestionCard: () => <div /> }));
vi.mock('./CvDocumentViewerDialog', () => ({ CvDocumentViewerDialog: () => null }));
vi.mock('@/shared/domain/jobDomains', () => ({ formatJobCategoryDisplay: (x: string) => x }));
afterEach(cleanup);
const legacy = /(?:bg|text|border)-(?:neutral|zinc|gray|slate)-\d+/;
function assertNoLegacy(container: HTMLElement) { for (const el of container.querySelectorAll('[class]')) expect(el.getAttribute('class')).not.toMatch(legacy); }
const analysis = { id: 'a', cvId: 'cv', jdId: null, jobCategory: 'BE', summary: 'Summary', strengths: [], weaknesses: [], suggestions: [], jdMatch: null, requirementSummary: { mustHave: { total: 0, strong: 0, partial: 0, weak: 0 }, niceToHave: { total: 0, strong: 0, partial: 0, weak: 0 } }, mustHaveMatches: [], niceToHaveMatches: [], cvSections: [], citations: [], createdAt: '2026-01-01' } as never;
describe('UX2 F2 CV and practice light theme', () => {
  it('removes legacy classes from report detail and accordion', () => {
    const detail = render(<CvAnalysisReportDetail analysis={analysis} />); assertNoLegacy(detail.container); cleanup();
    const item = render(<CvAnalysisAccordionItem item={analysis} isOpen={false} onToggle={vi.fn()} />); assertNoLegacy(item.container);
  });
  it('keeps skeleton card and shimmer surfaces distinct', () => {
    const { container } = render(<><CvAnalysisListSkeleton /><CvAnalysisDetailSkeleton /></>);
    assertNoLegacy(container);
    expect(container.querySelector('.bg-surface-raised')).toBeTruthy();
    expect(container.querySelectorAll('.bg-surface-highlight').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('.bg-surface-overlay').length).toBeGreaterThan(0);
  });
});
