import { ChevronRight, ListOrdered, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import { CampaignCriterionDetailModal } from './CampaignCriterionDetailModal';
import { CriterionLevelsEditor } from './CriterionLevelsEditor';
import type { CriteriaLockReason } from './criteriaLock';
import { CRITERIA_ROW_GRID } from './criteriaRowGrid';
import type { RubricCriterion } from '../../../types/campaignManagement.types';

interface CampaignRubricCriterionCardProps {
  criterion: RubricCriterion;
  index: number;
  disabled?: boolean;
  lockReason?: CriteriaLockReason;
  onChange: (patch: Partial<RubricCriterion>) => void;
  onRemove: () => void;
}

/**
 * Một hàng = MỘT băng ô nhập cao bằng nhau (`h-9`), thẳng cả mép trên lẫn mép dưới.
 * Bản trước có bốn ô cao khác nhau hoàn toàn (tên 72px · mô tả 112px · hai ô số 36px)
 * nên đáy so le — đó là chỗ hàng trông lởm chởm. Thứ dày thông tin (mô tả · mốc điểm ·
 * điểm sàn) chuyển sang `CampaignCriterionDetailModal`; dải tóm tắt bên dưới giữ lại
 * dấu hiệu cho biết bên trong có gì, để giấu đi không thành mất thông tin.
 */
export function CampaignRubricCriterionCard({
  criterion,
  index,
  disabled = false,
  lockReason,
  onChange,
  onRemove,
}: CampaignRubricCriterionCardProps) {
  const { t } = useLanguage();
  const [detailOpen, setDetailOpen] = useState(false);
  const [levelsOpen, setLevelsOpen] = useState(false);
  const indexLabel = String(index + 1).padStart(2, '0');
  const weight = Number(criterion.weight) || 0;
  const clamped = Math.max(0, Math.min(100, weight));
  // `maxScore` bên backend là Int32 (campaign_criteria.max_score) — số thập phân
  // bị từ chối bằng 400 `System.Int32`, tức lỗi chỉ lộ ra SAU khi employer bấm
  // lưu. Chặn ngay tại đây, và giữ `step={1}` ở ô nhập bên dưới.
  // `weight` thì ngược lại: numeric bên DB nên `step={0.1}` là đúng.
  const maxScoreValid =
    Number.isInteger(criterion.maxScore) && criterion.maxScore >= 1 && criterion.maxScore <= 10;
  const hasDescription = (criterion.description ?? '').trim().length > 0;
  const levelCount = criterion.levels?.length ?? 0;
  const floor = criterion.minPct;

  return (
    <article className="frame-satin rounded-xl border border-satin bg-surface-raised/60 px-3 py-3 sm:px-4 sm:py-4">
      <div className={cn('grid gap-3', CRITERIA_ROW_GRID, 'lg:items-center')}>
        <div className="flex min-w-0 items-center gap-3">
          {/* MỘT dấu hiệu đầu hàng. Bản trước có hai chip cạnh nhau (số thứ tự + icon
              lặp theo `index % 4`); icon không mang thông tin nào mà lại đặt một
              `rounded-full` sát một `rounded-lg`. */}
          <span className="frame-satin-soft flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-foreground">
            {indexLabel}
          </span>
          <div className="min-w-0 flex-1">
            <label className="sr-only" htmlFor={`campaign-rubric-name-${criterion.id}`}>
              {t('employer.campaigns.wizard.rubric.name')}
            </label>
            {/* Một dòng để bằng chiều cao hai ô số bên cạnh. Tên tiêu chí là nhãn ngắn
                ("Chiều sâu kỹ thuật"); giá trị KHÔNG bị cắt cụt (không `truncate`) và
                tên dài đọc trọn được ở tiêu đề popup chi tiết. */}
            <Input
              id={`campaign-rubric-name-${criterion.id}`}
              value={criterion.name}
              maxLength={255}
              disabled={disabled}
              title={criterion.name}
              onChange={(event) => onChange({ name: event.target.value })}
              className="border-satin bg-surface-overlay/70 text-sm font-semibold"
            />
          </div>
        </div>

        <div className="w-full lg:w-auto">
          <p className="mb-1 text-xs font-medium text-muted-foreground lg:hidden">
            {t('employer.campaigns.wizard.rubric.weight')}
          </p>
          <label className="sr-only" htmlFor={`campaign-rubric-weight-${criterion.id}`}>
            {t('employer.campaigns.wizard.rubric.weight')}
          </label>
          <div className="relative">
            <Input
              id={`campaign-rubric-weight-${criterion.id}`}
              type="number"
              min={0}
              max={100}
              step={0.1}
              disabled={disabled}
              value={criterion.weight}
              onChange={(event) => onChange({ weight: Number(event.target.value) })}
              className="border-satin bg-surface-overlay/70 text-sm"
            />
            {/* Thanh tỉ lệ ĐÈ lên mép dưới ô nhập chứ không nằm dưới nó: đặt bên dưới
                thì riêng cột trọng số cao hơn ~14px và cả băng hàng lệch đáy. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-px bottom-px h-[3px] overflow-hidden rounded-b-lg bg-surface-overlay"
            >
              <span
                className={cn(
                  'block h-full transition-[width,background-color] duration-300 ease-out',
                  clamped > 0 ? 'bg-success' : 'bg-muted-foreground/40',
                )}
                style={{ width: `${clamped}%` }}
              />
            </span>
          </div>
        </div>

        <div className="w-full lg:w-auto">
          <p className="mb-1 text-xs font-medium text-muted-foreground lg:hidden">
            {t('employer.campaigns.wizard.rubric.maxScore')}
          </p>
          <label className="sr-only" htmlFor={`campaign-rubric-max-${criterion.id}`}>
            {t('employer.campaigns.wizard.rubric.maxScore')}
          </label>
          <Input
            id={`campaign-rubric-max-${criterion.id}`}
            type="number"
            min={1}
            max={10}
            step={1}
            disabled={disabled}
            value={criterion.maxScore}
            aria-invalid={!maxScoreValid}
            onChange={(event) => onChange({ maxScore: Number(event.target.value) })}
            className={cn(
              'border-satin bg-surface-overlay/70 text-sm',
              !maxScoreValid && 'border-error text-error aria-invalid:border-error',
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            disabled={disabled}
            onClick={onRemove}
            aria-label={t('employer.campaigns.wizard.rubric.remove')}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      {/* Khoá bảng là cấm SỬA, không phải cấm ĐỌC — nút tóm tắt vẫn bấm được khi `disabled`
          để employer xem được mô tả và mốc điểm của bộ chuẩn. Nút "Sửa mốc" là nút ANH EM
          (không lồng vào nút tóm tắt — button trong button là HTML sai) và chỉ hiện khi sửa được. */}
      <div className="mt-3 flex items-center gap-2 border-t border-satin pt-2.5">
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => setDetailOpen(true)}
        className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-left text-xs text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground"
      >
        <Badge variant="outline">
          {hasDescription
            ? t('employer.campaigns.wizard.rubric.hasDesc')
            : t('employer.campaigns.wizard.rubric.noDesc')}
        </Badge>
        {/* Thiếu mốc là thứ chặn chấm thử — badge phải nổi để HR tìm ra tiêu chí nào thiếu, không lẫn với "6 mốc điểm". */}
        <Badge variant={levelCount > 0 ? 'outline' : 'warning'}>
          {levelCount > 0
            ? `${levelCount} ${t('employer.campaigns.wizard.rubric.levels')}`
            : t('employer.campaigns.wizard.rubric.noLevels')}
        </Badge>
        {typeof floor === 'number' ? (
          <Badge variant="outline">
            {t('employer.campaigns.wizard.rubric.floorBadge').replace('{{value}}', String(floor))}
          </Badge>
        ) : null}
        <span className="ml-auto inline-flex items-center gap-1 font-medium text-foreground">
          {t('employer.campaigns.wizard.rubric.detail')}
          <ChevronRight className="size-3.5" aria-hidden />
        </span>
      </button>
      {!disabled ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-haspopup="dialog"
          onClick={() => setLevelsOpen(true)}
          className="shrink-0"
        >
          <ListOrdered className="size-3.5" aria-hidden />
          {levelCount > 0
            ? t('employer.campaigns.wizard.levelsEditor.open')
            : t('employer.campaigns.wizard.levelsEditor.openEmpty')}
        </Button>
      ) : null}
      </div>

      <CampaignCriterionDetailModal
        open={detailOpen}
        criterion={criterion}
        indexLabel={indexLabel}
        disabled={disabled}
        lockReason={lockReason}
        onChange={onChange}
        onClose={() => setDetailOpen(false)}
        onEditLevels={
          disabled
            ? undefined
            : () => {
                // Một dialog tại một thời điểm: đóng chi tiết rồi mới mở bộ sửa mốc.
                setDetailOpen(false);
                setLevelsOpen(true);
              }
        }
      />
      <CriterionLevelsEditor
        open={levelsOpen}
        criterion={criterion}
        indexLabel={indexLabel}
        // `[]` = bỏ mốc ⇒ ghi `undefined` cho khớp quy ước `previewToRubric` (không mốc = vắng field).
        onSave={(levels) => onChange({ levels: levels.length ? levels : undefined })}
        onClose={() => setLevelsOpen(false)}
      />
    </article>
  );
}
