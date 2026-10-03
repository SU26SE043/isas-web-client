// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import type { AdminDeliveryMetrics, AdminRubricPreviewRun, AdminRubricPreviewSample } from '../../types/adminApi.types';
import { RubricTryYourScore, toSpeakingMetrics } from './RubricTryYourScore';

// Khoá có số trả TEMPLATE thật để {count}/{level} được thay — mock trả nguyên khoá thì đếm sai vẫn XANH (lý do
// lỗi "7 tiêu chí" lọt qua). Khoá khác trả nguyên khoá như cũ.
const TEMPLATES: Record<string, string> = {
  'admin.rubrics.try.result.fluencySkipped': 'SKIPPED · {count} remaining',
  'admin.rubrics.try.result.avgLevel': 'AVG {level}/5 · {count} criteria',
};
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => TEMPLATES[key] ?? key }) }));

const metrics: AdminDeliveryMetrics = { metricsVersion: 2, audioSec: 48, speechSec: 42, wordCount: 110, speechRateWpm: 157, longestPauseSec: 1.8, pauseCount: 3, silenceRatio: 0.12, fillerCount: 1, fillerPer100Words: 0.9, fillerBreakdown: {} };
const criterion = (criterionId: string, name: string) => ({ criterionId, name, weight: 1 / 3, maxScore: 5, levels: [] });
// Như API dev trả: snapshot rubric CÓ chứa tiêu chí đo "Độ trôi chảy & tự tin" (3 tiêu chí, bài dán chỉ chấm 2).
const run = { rubricVersion: 6, rubric: [criterion('a', 'Chiều sâu kỹ thuật'), criterion('b', 'Giao tiếp'), criterion('f', 'Độ trôi chảy & tự tin')] } as unknown as AdminRubricPreviewRun;
const score = (id: string, name: string, actual: number, measured = false) => ({ criterionId: id, criterionName: name, maxScore: 5, expectedLevel: 3, actualScore: actual, levelMatched: measured ? null : actual, reasoning: `lý do ${name}`, measured });
const custom = (over: Partial<AdminRubricPreviewSample>): AdminRubricPreviewSample => ({ band: 'Custom', answerText: 'bài', wordCount: 73, expectedPct: 60, actualPct: 65.71, deliveryMetrics: null, scores: [score('a', 'Chiều sâu kỹ thuật', 3), score('b', 'Giao tiếp', 3)], ...over });
afterEach(cleanup);

describe('RubricTryYourScore', () => {
  it('có bản ghi: hiện điểm to, số đo cách nói, hàng trôi chảy gắn nhãn ĐO — không có cột kỳ vọng', () => {
    render(<RubricTryYourScore run={run} sample={custom({ deliveryMetrics: metrics, scores: [score('a', 'Chiều sâu kỹ thuật', 3), score('b', 'Giao tiếp', 3), score('f', 'Độ trôi chảy & tự tin', 4, true)] })} />);
    expect(screen.getByText('66')).toBeInTheDocument();                       // 65.71 → 66 / 100
    expect(screen.getAllByText('admin.rubrics.try.result.measuredBadge').length).toBeGreaterThan(0);
    expect(screen.getByText('admin.rubrics.try.result.fluencyMeasured')).toBeInTheDocument();
    expect(screen.queryByText(/^SKIPPED/)).not.toBeInTheDocument();
    expect(screen.queryByText(/expected|kỳ vọng/i)).not.toBeInTheDocument();
    expect(screen.getByText('AVG 3.3/5 · 3 criteria')).toBeInTheDocument();             // (3+3+4)/3 trên 3 hàng chấm
  });

  it('dán tay (không số đo): nói rõ trôi chảy KHÔNG chấm và điểm tổng tính trên các tiêu chí còn lại', () => {
    render(<RubricTryYourScore run={run} sample={custom({})} />);
    // Rubric 3 tiêu chí (có tiêu chí đo), BE chấm 2 hàng ⇒ "còn lại 2", không phải 3 (lỗi cũ: rubric.length + 1 − 1).
    expect(screen.getByText('SKIPPED · 2 remaining')).toBeInTheDocument();
    expect(screen.getByText('AVG 3.0/5 · 2 criteria')).toBeInTheDocument();
    expect(screen.queryByText('admin.rubrics.try.result.measuredBadge')).not.toBeInTheDocument();
  });

  it('có số đo nhưng nói quá ngắn (BE không thêm hàng đo): nói "chưa đủ dài", không giả vờ 0 điểm', () => {
    render(<RubricTryYourScore run={run} sample={custom({ deliveryMetrics: { ...metrics, speechSec: 4 } })} />);
    expect(screen.getByText('admin.rubrics.try.result.fluencyTooShort')).toBeInTheDocument();
  });

  it('adapter số đo BE → panel phòng luyện: đúng tên trường (pauseCount→hesitationCount, speechRateWpm→speechRate, audioSec→audioDurationSec)', () => {
    // silenceRatio BE = 0.12 (tỉ lệ) → panel in kèm '%' ⇒ adapter đổi sang 12 (đo dev: để nguyên thì hiện '0.1%').
    expect(toSpeakingMetrics(metrics)).toMatchObject({ hesitationCount: 3, speechRate: 157, audioDurationSec: 48, silenceRatio: 12, fillerWordCount: 1, speechSec: 42, wordCount: 110 });
  });
});
