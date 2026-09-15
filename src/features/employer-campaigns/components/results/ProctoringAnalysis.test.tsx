// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProctoringAnalysis } from './ProctoringAnalysis';
import type { CampaignResultFlag } from '../../types/campaign.api.types';

vi.mock('@/shared/languages', () => ({
  useLanguage: () => ({ t: (key: string) => key, language: 'vi' }),
}));

const f = (type: string, count: number): CampaignResultFlag => ({ type, count, source: 'Client', note: null, firstAt: null, lastAt: null });

// Đúng bộ cờ đo trên dev 2026-09-15 (buổi c6ee0aa2): tổng 13, nhưng rời màn thi chỉ 5.
const NINE: CampaignResultFlag[] = [
  f('face_mismatch', 1), f('multiple_faces', 1), f('tab_switch', 4), f('no_face', 2),
  f('focus_lost', 1), f('paste', 1), f('camera_blocked', 1), f('identity_unverified', 1), f('monitoring_gap', 1),
];

describe('ProctoringAnalysis', () => {
  it('ô "Vi phạm cửa sổ" = 5 (tab 4 + focus 1), KHÔNG phải tổng 13', () => {
    render(<ProctoringAnalysis flags={NINE} />);
    const tile = screen.getByText('employer.campaigns.results.proctoring.windowViolations').closest('.rounded-xl')!;
    expect(tile).toHaveTextContent('05');
    expect(tile).not.toHaveTextContent('13');
  });

  it('chip in NHÃN i18n theo loại, không in khoá thô', () => {
    render(<ProctoringAnalysis flags={NINE} />);
    expect(screen.getAllByText(/employer\.campaigns\.results\.flags\.type\.face_mismatch: 1/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/employer\.campaigns\.results\.flags\.type\.monitoring_gap: 1/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/^face_mismatch: 1/)).not.toBeInTheDocument();
  });

  it('loại cờ lạ (backend thêm sau) vẫn hiện bằng khoá thô — không nuốt', () => {
    render(<ProctoringAnalysis flags={[f('weird_new_signal', 2)]} />);
    expect(screen.getByText(/weird_new_signal: 2/)).toBeInTheDocument();
  });
});
