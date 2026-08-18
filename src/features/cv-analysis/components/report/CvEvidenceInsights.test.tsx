// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NO_EVIDENCE, type CvAnalysisResult } from '../../types/cvAnalysis.types';
import { CvEvidenceInsights } from './CvEvidenceInsights';

const messages: Record<string, string> = {
  'cv.report.evidence.kicker': 'Dẫn chứng',
  'cv.report.evidence.title': 'Điểm mạnh và khoảng trống',
  'cv.report.evidence.description': 'Bấm để xem dẫn chứng',
  'cv.report.evidence.strengthDescription': 'Có dẫn chứng',
  'cv.report.evidence.gapDescription': 'Thiếu dẫn chứng',
  'cv.report.evidence.quote': 'Dẫn chứng từ CV',
  'cv.report.evidence.page': 'Trang',
  'cv.report.evidence.unknownSection': 'Không xác định mục',
  'cv.report.evidence.viewInCv': 'Xem trong CV',
  'cv.report.evidence.notFoundTitle': 'Không tìm thấy bằng chứng trong CV',
  'cv.report.evidence.notFoundDescription': 'Hệ thống không tạo câu trích giả.',
  'cv.report.evidence.emptyGroup': 'Không có yêu cầu',
  'cv.report.strengths': 'Điểm mạnh',
  'cv.report.weaknesses': 'Điểm yếu',
  'cv.report.priority.MustHave': 'Bắt buộc',
  'cv.report.priority.NiceToHave': 'Ưu tiên',
  'cv.report.level.Strong': 'Tốt',
  'cv.report.level.Partial': 'Đáp ứng một phần',
  'cv.report.level.Weak': 'Chưa đạt',
};

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => messages[key] ?? key }),
}));

afterEach(cleanup);

const analysis: CvAnalysisResult = {
  id: 'analysis-1', cvId: 'cv-1', jdId: 'jd-1', jobCategory: 'BE', summary: '',
  strengths: [], weaknesses: [], suggestions: [], jdMatch: null, requirementSummary: null,
  mustHaveMatches: [
    {
      requirementId: 'strong-1', text: 'ASP.NET Core', priority: 'MustHave', level: 'Strong',
      evidence: 'Developed ASP.NET Core APIs for three years', page: 2, sectionTitle: 'Experience',
    },
    {
      requirementId: 'partial-1', text: 'Docker', priority: 'MustHave', level: 'Partial',
      evidence: 'Used Docker for local development', page: 3, sectionTitle: 'Skills',
    },
  ],
  niceToHaveMatches: [{
    requirementId: 'weak-1', text: 'Kubernetes', priority: 'NiceToHave', level: 'Weak',
    evidence: NO_EVIDENCE, page: null, sectionTitle: null,
  }],
  cvSections: [], citations: [], createdAt: '2026-08-18T00:00:00Z',
};

describe('CvEvidenceInsights', () => {
  it('shows Partial matches in strengths and Weak matches in weaknesses', () => {
    render(<CvEvidenceInsights analysis={analysis} onViewCv={vi.fn()} />);

    const strengths = screen.getByText('Điểm mạnh').closest('section');
    const weaknesses = screen.getByText('Điểm yếu').closest('section');
    expect(strengths).not.toBeNull();
    expect(weaknesses).not.toBeNull();
    expect(within(strengths!).getByRole('button', { name: /Docker.*Đáp ứng một phần/ })).toBeVisible();
    expect(within(weaknesses!).getByRole('button', { name: /Kubernetes.*Chưa đạt/ })).toBeVisible();
  });

  it('reveals a verbatim quote and opens the CV at its evidence', async () => {
    const onViewCv = vi.fn();
    const user = userEvent.setup();
    render(<CvEvidenceInsights analysis={analysis} onViewCv={onViewCv} />);

    await user.click(screen.getByRole('button', { name: /ASP.NET Core/ }));
    expect(screen.getByText('“Developed ASP.NET Core APIs for three years”')).toBeVisible();
    expect(screen.getByText('Experience · Trang 2')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Xem trong CV' }));
    expect(onViewCv).toHaveBeenCalledWith(analysis.mustHaveMatches[0]);
  });

  it('shows evidence absence without fabricating a quote', async () => {
    const user = userEvent.setup();
    render(<CvEvidenceInsights analysis={analysis} onViewCv={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /Kubernetes/ }));
    expect(screen.getByText('Không tìm thấy bằng chứng trong CV')).toBeVisible();
    expect(screen.getByText('Hệ thống không tạo câu trích giả.')).toBeVisible();
    expect(screen.queryByText(`“${NO_EVIDENCE}”`)).not.toBeInTheDocument();
  });
});
