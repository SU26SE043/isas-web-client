import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import { LEVEL_DESCRIPTOR_MAX } from '../../../utils/criterionLevelRules';

export type LevelDraftRow = {
  key: string;
  /** Giữ dạng chuỗi để ô trống ("") khác với số 0 — số 0 là một mốc BẮT BUỘC. */
  score: string;
  descriptor: string;
};

interface CriterionLevelRowProps {
  row: LevelDraftRow;
  maxScore: number;
  /** Lỗi của CHÍNH hàng này (đã dịch) — hiện ngay dưới hàng, không gom lên đầu. */
  error?: string | null;
  onChange: (patch: Partial<LevelDraftRow>) => void;
  onRemove: () => void;
}

/**
 * Một mốc = điểm + mô tả. Trên 375px: điểm và nút xoá ở dòng 1, mô tả chiếm trọn dòng 2;
 * từ `sm` ba thứ nằm cùng một hàng. Mô tả là textarea 2 dòng kèm đếm ký tự /500 vì trần
 * 20–500 là luật backend (CAMP-17) — người viết cần thấy mình đang ở đâu trước khi bấm Lưu.
 */
export function CriterionLevelRow({ row, maxScore, error, onChange, onRemove }: CriterionLevelRowProps) {
  const { t } = useLanguage();
  const scoreId = `level-score-${row.key}`;
  const descriptorId = `level-desc-${row.key}`;
  const length = row.descriptor.trim().length;
  const invalid = Boolean(error);

  return (
    <li className={cn('frame-satin-soft rounded-xl bg-surface-overlay/50 p-3', invalid && 'border border-error/40')}>
      <div className="grid grid-cols-[5.5rem_minmax(0,1fr)_auto] items-start gap-2">
        <div>
          <label className="sr-only" htmlFor={scoreId}>
            {t('employer.campaigns.wizard.levelsEditor.score')}
          </label>
          <Input
            id={scoreId}
            type="number"
            inputMode="numeric"
            min={0}
            max={maxScore}
            step={1}
            value={row.score}
            aria-invalid={invalid}
            onChange={(event) => onChange({ score: event.target.value })}
            className="text-sm font-semibold"
          />
        </div>
        <span aria-hidden className="sm:hidden" />
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          onClick={onRemove}
          aria-label={t('employer.campaigns.wizard.levelsEditor.removeLevel').replace('{{score}}', row.score || '?')}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" aria-hidden />
        </Button>
        <div className="col-span-3 min-w-0 sm:col-[2/3] sm:row-start-1">
          <label className="sr-only" htmlFor={descriptorId}>
            {t('employer.campaigns.wizard.levelsEditor.descriptor')}
          </label>
          <Textarea
            id={descriptorId}
            rows={3}
            value={row.descriptor}
            maxLength={LEVEL_DESCRIPTOR_MAX}
            aria-invalid={invalid}
            placeholder={t('employer.campaigns.wizard.levelsEditor.descriptorPlaceholder')}
            onChange={(event) => onChange({ descriptor: event.target.value })}
          />
          <p className="mt-1 text-right text-[11px] text-muted-foreground">
            {t('employer.campaigns.wizard.levelsEditor.charCount').replace('{{count}}', String(length))}
          </p>
        </div>
      </div>
      {error ? (
        <p role="alert" className="mt-1 text-xs text-error">
          {error}
        </p>
      ) : null}
    </li>
  );
}
