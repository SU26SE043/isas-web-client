// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import type { AdminDeliveryMetrics, AdminRubricPreviewRun, AdminRubricPreviewSample } from '../../types/adminApi.types';
import { RubricTryYourScore, toSpeakingMetrics } from './RubricTryYourScore';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));

const metrics: AdminDeliveryMetrics = { metricsVersion: 2, audioSec: 48, speechSec: 42, wordCount: 110, speechRateWpm: 157, longestPauseSec: 1.8, pauseCount: 3, silenceRatio: 0.12, fillerCount: 1, fillerPer100Words: 0.9, fillerBreakdown: {} };
const run = { rubricVersion: 6, rubric: [{ criterionId: 'a', name: 'Chiều sâu kỹ thuật', weight: 0.5, maxScore: 5, levels: [] }, { criterionId: 'b', name: 'Giao tiếp', weight: 0.5, maxScore: 5, levels: [] }] } as unknown as AdminRubricPreviewRun;
const score = (id: string, name: string, actual: number, measured = false) => ({ criterionId: id, criterionName: name, maxScore: 5, expectedLevel: 3, actualScore: actual, levelMatched: measured ? null : actual, reasoning: `lý do ${name}`, measured });
const custom = (over: Partial<AdminRubricPreviewSample>): AdminRubricPreviewSample => ({ band: 'Custom', answerText: 'bài', wordCount: 73, expectedPct: 60, actualPct: 65.71, deliveryMetrics: null, scores: [score('a', 'Chiều sâu kỹ thuật', 3), score('b', 'Giao tiếp', 3)], ...over });
afterEach(cleanup);

describe('RubricTryYourScore', () => {
  it('có bản ghi: hiện điểm to, số đo cách nói, hàng trôi chảy gắn nhãn ĐO — không có cột kỳ vọng', () => {
    render(<RubricTryYourScore run={run} sample={custom({ deliveryMetrics: metrics, scores: [score('a', 'Chiều sâu kỹ thuật', 3), score('b', 'Giao tiếp', 3), score('f', 'Độ trôi chảy & tự tin', 4, true)] })} />);
    expect(screen.getByText('66')).toBeInTheDocument();                       // 65.71 → 66 / 100
    expect(screen.getAllByText('admin.rubrics.try.result.measuredBadge').length).toBeGreaterThan(0);
    expect(screen.getByText('admin.rubrics.try.result.fluencyMeasured')).toBeInTheDocument();
    expect(screen.queryByText('admin.rubrics.try.result.fluencySkipped')).not.toBeInTheDocument();
    expect(screen.queryByText(/expected|kỳ vọng/i)).not.toBeInTheDocument();
    expect(screen.getByText('admin.rubrics.try.result.avgLevel')).toBeInTheDocument();
  });

  it('dán tay (không số đo): nói rõ trôi chảy KHÔNG chấm và điểm tổng tính trên các tiêu chí còn lại', () => {
    render(<RubricTryYourScore run={run} sample={custom({})} />);
    expect(screen.getByText('admin.rubrics.try.result.fluencySkipped')).toBeInTheDocument();
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
