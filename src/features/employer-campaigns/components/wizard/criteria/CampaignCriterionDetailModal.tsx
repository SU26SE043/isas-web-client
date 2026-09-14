import { ListOrdered, Lock } from 'lucide-react';
import { AppModal } from '@/components/ui/app-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/shared/languages';
import { criteriaLockCopyKey, type CriteriaLockReason } from './criteriaLock';
import type { RubricCriterion } from '../../../types/campaignManagement.types';

interface CampaignCriterionDetailModalProps {
  open: boolean;
  criterion: RubricCriterion;
  indexLabel: string;
  disabled?: boolean;
  lockReason?: CriteriaLockReason;
  onChange: (patch: Partial<RubricCriterion>) => void;
  onClose: () => void;
  /** Mở bộ sửa mốc (do card sở hữu). Không truyền khi bảng khoá ⇒ không có nút. */
  onEditLevels?: () => void;
}

/**
 * Phần dày thông tin của một tiêu chí: mô tả, mốc điểm, điểm sàn. Trước đây chúng nằm
 * ngay trên hàng (textarea `min-h-[112px]`) và trong một vùng bung ra, khiến hàng vừa
 * cao lởm chởm vừa không đọc nổi. Đưa vào popup để hàng còn đúng một băng ô nhập cao
 * bằng nhau.
 *
 * KHÔNG giữ state trung gian: mọi ô ở đây ghi thẳng qua `onChange` của hàng, nên popup
 * không thể lệch với dữ liệu hàng — và `disabled` cũng vì thế mà có tác dụng y hệt.
 */
export function CampaignCriterionDetailModal({
  open,
  criterion,
  indexLabel,
  disabled = false,
  lockReason,
  onChange,
  onClose,
  onEditLevels,
}: CampaignCriterionDetailModalProps) {
  const { t } = useLanguage();
  const levels = criterion.levels ?? [];
  const title = t('employer.campaigns.wizard.rubric.detailTitle');
  const descriptionId = `campaign-rubric-desc-${criterion.id}`;
  const floorId = `campaign-rubric-floor-${criterion.id}`;

  return (
    <AppModal open={open} onClose={onClose} size="lg" ariaLabel={title}>
      <div className="space-y-5">
        <header className="flex items-start gap-3 pr-12">
          <span className="frame-satin-soft flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-foreground">
            {indexLabel}
          </span>
          <div className="min-w-0">
            <p className="text-caption text-muted-foreground">{title}</p>
            {/* Tên đầy đủ, xuống dòng được. Ô nhập tên ở hàng là MỘT dòng nên tên dài chỉ
                đọc trọn được ở đây — đừng bỏ chỗ này đi. */}
            <h2 className="text-base leading-relaxed font-semibold break-words text-foreground">
              {criterion.name.trim() || t('employer.campaigns.wizard.rubric.unnamed')}
            </h2>
          </div>
        </header>

        {disabled ? (
          <div role="status" className="frame-satin-soft flex items-start gap-2.5 rounded-xl bg-surface-overlay/60 px-3.5 py-2.5">
            <Lock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                {t('employer.campaigns.wizard.rubric.lockedTitle')}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {t(criteriaLockCopyKey(lockReason)).replace(
                  '{{action}}',
                  t('employer.campaigns.wizard.criteriaCustomize'),
                )}
              </p>
            </div>
          </div>
        ) : null}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor={descriptionId}>
            {t('employer.campaigns.wizard.rubric.criterionDesc')}
          </label>
          <Textarea
            id={descriptionId}
            rows={5}
            value={criterion.description}
            disabled={disabled}
            placeholder={t('employer.campaigns.wizard.rubric.descPlaceholder')}
            onChange={(event) => onChange({ description: event.target.value })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_9rem]">
          <section className="min-w-0 space-y-1.5">
            <div className="flex min-h-7 items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">
                {t('employer.campaigns.wizard.rubric.levelsTitle')}
              </p>
              {/* Chỉ khi sửa được: popup này không phải cửa hậu qua khoá bảng. */}
              {onEditLevels && !disabled ? (
                <Button type="button" variant="outline" size="sm" onClick={onEditLevels}>
                  <ListOrdered className="size-3.5" aria-hidden />
                  {levels.length
                    ? t('employer.campaigns.wizard.levelsEditor.open')
                    : t('employer.campaigns.wizard.levelsEditor.openEmpty')}
                </Button>
              ) : null}
            </div>
            {levels.length ? (
              <ul className="frame-satin-soft space-y-1 rounded-xl bg-surface-overlay/50 px-3 py-2">
                {levels.map((level) => (
                  <li key={`${criterion.id}-${level.score}`} className="text-xs leading-relaxed text-muted-foreground">
                    <strong className="text-foreground">{level.score}</strong> · {level.descriptor}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs leading-relaxed text-muted-foreground">
                {t('employer.campaigns.wizard.rubric.noLevels')}
              </p>
            )}
          </section>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor={floorId}>
              {t('employer.campaigns.wizard.rubric.minPct')}
            </label>
            {/* Giữ nguyên `min={0}` không trần trên như bản cũ — thêm `max` ở đây là đổi
                luật hợp lệ mà backend chưa chắc đồng ý. */}
            <Input
              id={floorId}
              type="number"
              min={0}
              value={criterion.minPct ?? ''}
              disabled={disabled}
              onChange={(event) => {
                const value = event.target.value.trim();
                onChange({ minPct: value === '' ? null : Number(value) });
              }}
            />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {t('employer.campaigns.wizard.rubric.minPctHelp')}
            </p>
          </div>
        </div>

        <footer className="flex justify-end">
          <Button type="button" variant="outline" size="lg" onClick={onClose}>
            {t('employer.campaigns.wizard.rubric.close')}
          </Button>
        </footer>
      </div>
    </AppModal>
  );
}
