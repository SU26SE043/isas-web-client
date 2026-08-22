import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { MilestoneScoreReportPanel } from './MilestoneScoreReportPanel';

export type MilestoneImprovementItem = { criterionName: string; deltaPct: number };

/**
 * Tiêu chí DỊCH CHUYỂN MẠNH NHẤT mỗi chiều (nhiều nhất 2 mục) — giữ nguyên hành vi
 * cũ của dòng tiêu đề, chỉ tách ra khỏi JSX để kiểm được. Trước vòng này logic này
 * nằm trong một IIFE và KHÔNG có test nào chạm tới.
 */
export function pickHeadlineMovements(improvement: MilestoneImprovementItem[] | null | undefined): MilestoneImprovementItem[] {
  const moved = (improvement ?? []).filter((item) => item.deltaPct !== 0);
  if (moved.length === 0) return [];
  const up = moved.reduce((a, b) => (b.deltaPct > a.deltaPct ? b : a));
  const down = moved.reduce((a, b) => (b.deltaPct < a.deltaPct ? b : a));
  return [up.deltaPct > 0 ? up : null, down.deltaPct < 0 ? down : null].filter((x): x is MilestoneImprovementItem => x !== null);
}

interface MilestoneImprovementDisclosureProps {
  roadmapId: string;
  milestoneId: string;
  milestoneStatus: string;
  improvement: MilestoneImprovementItem[] | null | undefined;
}

export function MilestoneImprovementDisclosure({ roadmapId, milestoneId, milestoneStatus, improvement }: MilestoneImprovementDisclosureProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const picks = milestoneStatus === 'completed' ? pickHeadlineMovements(improvement) : [];
  const Chevron = open ? ChevronDown : ChevronRight;

  return (
    <div className="mt-2">
      {/*
        CỐ Ý không gác sau `status === 'completed'`: chặng chưa xong vẫn xem được
        phần tính (chỉ là chưa có delta). Gác lại thì đúng lúc người học đang học
        dở và muốn biết mình đang ở đâu lại là lúc không mở được.
      */}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={t(open ? 'practice.milestoneReport.hide' : 'practice.milestoneReport.show')}
        className="focus-ring flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg text-left text-caption text-muted-foreground hover:text-foreground"
      >
        {picks.length ? (
          <>
            <span>{t('practice.learningPath.improvementTitle')}</span>
            {picks.map((item) => (
              <span key={item.criterionName} className="inline-flex items-center gap-1">
                <span className={item.deltaPct < 0 ? 'font-semibold text-error' : 'font-semibold text-success'}>
                  {item.deltaPct >= 0 ? '+' : '−'}{Math.abs(item.deltaPct)}%
                </span>
                <span>{item.criterionName}</span>
              </span>
            ))}
            <span className="underline underline-offset-2">{t(open ? 'practice.milestoneReport.hide' : 'practice.milestoneReport.show')}</span>
          </>
        ) : (
          <span className="underline underline-offset-2">{t('practice.milestoneReport.showGeneric')}</span>
        )}
        <Chevron className="size-3.5" aria-hidden />
      </button>
      {open ? <MilestoneScoreReportPanel roadmapId={roadmapId} milestoneId={milestoneId} /> : null}
    </div>
  );
}
