// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));
vi.mock('./MilestoneScoreReportPanel', () => ({
  MilestoneScoreReportPanel: ({ roadmapId, milestoneId }: { roadmapId: string; milestoneId: string }) => (
    <div>panel {roadmapId} {milestoneId}</div>
  ),
}));

import { MilestoneImprovementDisclosure, pickHeadlineMovements } from './MilestoneImprovementDisclosure';

const renderDisclosure = (status: string, improvement: Array<{ criterionName: string; deltaPct: number }> | null) =>
  render(<MilestoneImprovementDisclosure roadmapId="rm-1" milestoneId="ms-2" milestoneStatus={status} improvement={improvement} />);

afterEach(() => cleanup());

describe('pickHeadlineMovements', () => {
  it('lấy tiêu chí dịch chuyển mạnh nhất MỖI CHIỀU, nhiều nhất 2 mục', () => {
    expect(
      pickHeadlineMovements([
        { criterionName: 'a', deltaPct: 5 },
        { criterionName: 'b', deltaPct: 12 },
        { criterionName: 'c', deltaPct: -20 },
        { criterionName: 'd', deltaPct: -3 },
      ]),
    ).toEqual([{ criterionName: 'b', deltaPct: 12 }, { criterionName: 'c', deltaPct: -20 }]);
  });

  it('bỏ các dòng +0% (trên dữ liệu thật phần lớn là 0)', () => {
    expect(pickHeadlineMovements([{ criterionName: 'a', deltaPct: 0 }, { criterionName: 'b', deltaPct: 0 }])).toEqual([]);
  });

  it('chỉ một chiều thì chỉ một mục', () => {
    expect(pickHeadlineMovements([{ criterionName: 'a', deltaPct: 7 }])).toEqual([{ criterionName: 'a', deltaPct: 7 }]);
    expect(pickHeadlineMovements([{ criterionName: 'a', deltaPct: -7 }])).toEqual([{ criterionName: 'a', deltaPct: -7 }]);
  });

  it('không có dữ liệu thì rỗng, không nổ', () => {
    expect(pickHeadlineMovements(null)).toEqual([]);
    expect(pickHeadlineMovements(undefined)).toEqual([]);
    expect(pickHeadlineMovements([])).toEqual([]);
  });
});

describe('MilestoneImprovementDisclosure', () => {
  const improvement = [{ criterionName: 'Giao tiếp & trình bày', deltaPct: -20 }];

  it('mặc định đóng — không gọi API cho thứ gần như không ai mở', () => {
    renderDisclosure('completed', improvement);
    expect(screen.queryByText(/^panel/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'practice.milestoneReport.show' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('bấm vào là mở ra phần tính, đúng chặng đang xem', () => {
    renderDisclosure('completed', improvement);
    fireEvent.click(screen.getByRole('button', { name: 'practice.milestoneReport.show' }));
    expect(screen.getByText('panel rm-1 ms-2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'practice.milestoneReport.hide' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('dòng tiêu đề vẫn nêu con số như cũ, và nay nói rõ là mở được', () => {
    renderDisclosure('completed', improvement);
    expect(screen.getByText('practice.learningPath.improvementTitle')).toBeInTheDocument();
    expect(screen.getByText('−20%')).toBeInTheDocument();
    expect(screen.getByText('Giao tiếp & trình bày')).toBeInTheDocument();
  });

  it('chặng CHƯA hoàn thành vẫn mở được phần tính — không gác sau trạng thái Completed', () => {
    renderDisclosure('current', null);
    fireEvent.click(screen.getByRole('button', { name: 'practice.milestoneReport.show' }));
    expect(screen.getByText('panel rm-1 ms-2')).toBeInTheDocument();
  });

  it('chặng chưa hoàn thành thì không nêu con số delta (chưa có), chỉ mời xem điểm', () => {
    renderDisclosure('current', improvement);
    expect(screen.queryByText('practice.learningPath.improvementTitle')).not.toBeInTheDocument();
    expect(screen.queryByText('−20%')).not.toBeInTheDocument();
    expect(screen.getByText('practice.milestoneReport.showGeneric')).toBeInTheDocument();
  });

  it('chặng bị khoá cũng mở được (chỉ là chưa có buổi nào)', () => {
    renderDisclosure('locked', null);
    expect(screen.getByRole('button', { name: 'practice.milestoneReport.show' })).toBeInTheDocument();
  });
});
