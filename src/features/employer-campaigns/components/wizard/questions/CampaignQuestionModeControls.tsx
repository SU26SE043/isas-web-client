import { useLanguage } from '@/shared/languages';

interface CampaignQuestionModeControlsProps {
  drawMode: boolean;
  fixedCount: number;
  poolCount: number;
  drawCount: number;
  totalPerCandidate: number;
  disabled?: boolean;
  onSelectMode: (drawMode: boolean) => void;
  onDrawCountChange: (count: number) => void;
}

export function CampaignQuestionModeControls({
  drawMode,
  fixedCount,
  poolCount,
  drawCount,
  totalPerCandidate,
  disabled = false,
  onSelectMode,
  onDrawCountChange,
}: CampaignQuestionModeControlsProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-satin bg-surface-overlay px-4 py-3">
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="radio" name="campaign-question-mode" checked={!drawMode} disabled={disabled} onChange={() => onSelectMode(false)} />
          {t('employer.campaigns.campaignQuestions.mode.all')}
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="radio" name="campaign-question-mode" checked={drawMode} disabled={disabled} onChange={() => onSelectMode(true)} />
          {t('employer.campaigns.campaignQuestions.mode.draw')}
        </label>
      </div>
      {drawMode ? (
        <label className="flex items-center gap-2 text-sm text-foreground" htmlFor="campaign-question-draw-count">
          {t('employer.campaigns.campaignQuestions.draw.countLabel')}
          <input
            id="campaign-question-draw-count"
            type="number"
            min={0}
            max={poolCount}
            value={drawCount}
            disabled={disabled}
            onChange={(event) => onDrawCountChange(Math.min(Math.max(Number(event.target.value) || 0, 0), poolCount))}
            className="h-9 w-20 rounded-xl border border-satin bg-surface-base px-3 text-sm"
          />
        </label>
      ) : null}
      <p className="text-xs text-muted-foreground">
        {drawMode
          ? t('employer.campaigns.campaignQuestions.draw.total').replace('{{fixed}}', String(fixedCount)).replace('{{draw}}', String(drawCount)).replace('{{total}}', String(totalPerCandidate))
          : t('employer.campaigns.campaignQuestions.mode.allHint')}
      </p>
    </div>
  );
}
