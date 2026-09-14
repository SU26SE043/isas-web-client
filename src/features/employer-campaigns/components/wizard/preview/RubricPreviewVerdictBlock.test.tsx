/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { goodRun, sample } from '../../../mocks/rubricPreview.fixtures';
import { computeVerdict } from '../../../utils/rubricPreviewVerdict';
import { customPosition, RubricPreviewVerdictBlock } from './RubricPreviewVerdictBlock';

const messages: Record<string, string> = {
  'employer.campaigns.rubricPreview.custom.betweenGoodExcellent': 'Của bạn {{pct}} giữa {{low}} và {{high}}',
  'employer.campaigns.rubricPreview.custom.aboveExcellent': 'Của bạn {{pct}} trên {{high}}',
  'employer.campaigns.rubricPreview.compression': 'nén {{weakOver}}/{{total}} · {{excellentUnder}}/{{total}}',
};
vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => messages[key] ?? key, language: 'vi' }) }));

afterEach(cleanup);

const withCustom = (pct: number) => goodRun({ samples: [...goodRun().samples, sample('Custom', 0, pct)] });

describe('customPosition — bài tự dán nằm ở đâu so với Yếu 18 · Khá 62 · Xuất sắc 88', () => {
  it('dưới Yếu / giữa Yếu–Khá / giữa Khá–Xuất sắc / trên Xuất sắc; biên thuộc khoảng dưới', () => {
    expect(customPosition(withCustom(10))).toEqual({ key: 'belowWeak', pct: 10, low: 18 });
    expect(customPosition(withCustom(18))).toEqual({ key: 'betweenWeakGood', pct: 18, low: 18, high: 62 });
    expect(customPosition(withCustom(62))).toEqual({ key: 'betweenWeakGood', pct: 62, low: 18, high: 62 });
    expect(customPosition(withCustom(70))).toEqual({ key: 'betweenGoodExcellent', pct: 70, low: 62, high: 88 });
    expect(customPosition(withCustom(88))).toEqual({ key: 'betweenGoodExcellent', pct: 88, low: 62, high: 88 });
    expect(customPosition(withCustom(95))).toEqual({ key: 'aboveExcellent', pct: 95, high: 88 });
  });

  it('không có bài Custom ⇒ null; thiếu bài AI để đối chiếu ⇒ null (không bịa vị trí)', () => {
    expect(customPosition(goodRun())).toBeNull();
    expect(customPosition(goodRun({ samples: [sample('Custom', 0, 50)] }))).toBeNull();
  });
});

describe('RubricPreviewVerdictBlock', () => {
  it('điền pct/low/high kèm dấu % vào câu vị trí; tổng {{total}} thay ở MỌI chỗ trong câu nén', () => {
    const run = withCustom(70);
    render(<RubricPreviewVerdictBlock run={run} verdict={computeVerdict(run, null)} />);
    expect(screen.getByTestId('preview-custom-position')).toHaveTextContent('Của bạn 70% giữa 62% và 88%');
    cleanup();
    const verdict = { ...computeVerdict(goodRun(), null), compression: { weakOver: 2, excellentUnder: 1, total: 2 } };
    render(<RubricPreviewVerdictBlock run={goodRun()} verdict={verdict} />);
    expect(screen.getByTestId('preview-compression')).toHaveTextContent('nén 2/2 · 1/2');
  });
});
