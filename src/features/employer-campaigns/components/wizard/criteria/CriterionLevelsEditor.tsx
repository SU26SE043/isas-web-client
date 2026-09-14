import { Plus, Ruler } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AppModal } from '@/components/ui/app-modal';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import type { RubricLevel } from '@/features/rubrics/types/rubric.types';
import type { RubricCriterion } from '../../../types/campaignManagement.types';
import {
  LEVELS_MAX_COUNT,
  normalizeCriterionLevels,
  validateCriterionLevels,
  type CriterionLevelsValidation,
} from '../../../utils/criterionLevelRules';
import { CriterionLevelRow, type LevelDraftRow } from './CriterionLevelRow';
import { isRowLevelError, levelsErrorMessage } from './criterionLevelsCopy';

interface CriterionLevelsEditorProps {
  open: boolean;
  criterion: RubricCriterion;
  indexLabel: string;
  /** Mảng rỗng = tiêu chí KHÔNG có mốc (hợp lệ — mốc là tuỳ chọn, CAMP-14). */
  onSave: (levels: RubricLevel[]) => void;
  onClose: () => void;
}

let draftSeq = 0;
function draftKey(): string {
  draftSeq += 1;
  return `d${draftSeq}`;
}

function toRows(levels: RubricLevel[] | undefined): LevelDraftRow[] {
  return normalizeCriterionLevels(levels ?? []).map((level) => ({
    key: draftKey(),
    score: String(level.score),
    descriptor: level.descriptor,
  }));
}

function toLevels(rows: LevelDraftRow[]): RubricLevel[] {
  // Ô trống → NaN (không phải 0): số 0 là một mốc bắt buộc, coi ô trống là 0 sẽ che mất lỗi.
  return rows.map((row) => ({
    score: row.score.trim() === '' ? Number.NaN : Number(row.score),
    descriptor: row.descriptor,
  }));
}

/** Điểm nguyên nhỏ nhất trong [0, max] chưa có hàng nào dùng — để "Thêm mốc" không đẻ ra mốc trùng. */
function nextFreeScore(rows: LevelDraftRow[], maxScore: number): number {
  const used = new Set(rows.map((row) => Number(row.score)));
  for (let score = 0; score <= maxScore; score += 1) if (!used.has(score)) return score;
  return maxScore;
}

/**
 * Bộ sửa MỐC ĐIỂM của MỘT tiêu chí (CAMP-17). Mở như dialog để hàng tiêu chí giữ nguyên
 * một băng ô nhập; dùng được trên 375px (mỗi mốc xếp dọc, xem `CriterionLevelRow`).
 *
 * Luật kiểm ở `validateCriterionLevels` — cùng số với backend. Lỗi gắn hàng nào hiện ngay dưới
 * hàng đó; lỗi cấu trúc (đếm mốc, thiếu mốc biên) hiện dưới bảng. Chỉ kiểm khi bấm Lưu và
 * kiểm lại sau mỗi lần sửa kể từ đó — kiểm ngay lúc gõ thì mô tả đang gõ dở luôn "quá ngắn".
 *
 * Form là component con để state reset mỗi lần mở (`AppModal` unmount children khi đóng).
 */
export function CriterionLevelsEditor({ open, criterion, indexLabel, onSave, onClose }: CriterionLevelsEditorProps) {
  const { t } = useLanguage();
  const title = t('employer.campaigns.wizard.levelsEditor.title');
  return (
    <AppModal open={open} onClose={onClose} size="lg" ariaLabel={title}>
      <LevelsEditorForm criterion={criterion} indexLabel={indexLabel} onSave={onSave} onClose={onClose} />
    </AppModal>
  );
}

function LevelsEditorForm({ criterion, indexLabel, onSave, onClose }: Omit<CriterionLevelsEditorProps, 'open'>) {
  const { t } = useLanguage();
  const maxScore = Number(criterion.maxScore);
  const [rows, setRows] = useState<LevelDraftRow[]>(() => toRows(criterion.levels));
  const [attempted, setAttempted] = useState(false);
  const K = 'employer.campaigns.wizard.levelsEditor';

  const validation = useMemo<CriterionLevelsValidation | null>(
    () => (rows.length === 0 ? null : validateCriterionLevels(toLevels(rows), maxScore)),
    [rows, maxScore],
  );
  const shownError = attempted && validation && !validation.ok ? validation : null;
  const rowError = shownError && isRowLevelError(shownError) ? shownError : null;
  const globalError = shownError && !isRowLevelError(shownError) ? shownError : null;
  const errorText = (error: NonNullable<typeof shownError>) =>
    levelsErrorMessage(t, error, {
      maxScore,
      count: rows.length,
      descriptorLength: typeof error.index === 'number' ? rows[error.index]?.descriptor.trim().length : undefined,
    });

  const hasScore = (score: number) => rows.some((row) => Number(row.score) === score);
  const scaffoldDisabled = hasScore(0) && hasScore(maxScore);
  const addDisabled = rows.length >= LEVELS_MAX_COUNT;

  const updateRow = (key: string, patch: Partial<LevelDraftRow>) =>
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  const scaffold = () =>
    setRows((current) => {
      const next = [...current];
      if (!current.some((row) => Number(row.score) === 0)) next.unshift({ key: draftKey(), score: '0', descriptor: '' });
      if (!current.some((row) => Number(row.score) === maxScore)) next.push({ key: draftKey(), score: String(maxScore), descriptor: '' });
      return next;
    });

  const addRow = () =>
    setRows((current) => [...current, { key: draftKey(), score: String(nextFreeScore(current, maxScore)), descriptor: '' }]);

  const save = () => {
    setAttempted(true);
    if (rows.length === 0) {
      onSave([]);
      onClose();
      return;
    }
    if (!validation || !validation.ok) return;
    onSave(normalizeCriterionLevels(toLevels(rows)));
    onClose();
  };

  return (
    <div className="space-y-5">
      <header className="flex items-start gap-3 pr-12">
        <span className="frame-satin-soft flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-foreground">
          {indexLabel}
        </span>
        <div className="min-w-0">
          <p className="text-caption text-muted-foreground">{t(`${K}.title`)}</p>
          <h2 className="text-base leading-relaxed font-semibold break-words text-foreground">
            {criterion.name.trim() || t('employer.campaigns.wizard.rubric.unnamed')}
          </h2>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {t(`${K}.subtitle`).replaceAll('{{max}}', String(maxScore))}
          </p>
        </div>
      </header>

      {rows.length ? (
        <ul className="space-y-2">
          {rows.map((row, index) => (
            <CriterionLevelRow
              key={row.key}
              row={row}
              maxScore={maxScore}
              error={rowError && rowError.index === index ? errorText(rowError) : null}
              onChange={(patch) => updateRow(row.key, patch)}
              onRemove={() => setRows((current) => current.filter((item) => item.key !== row.key))}
            />
          ))}
        </ul>
      ) : (
        <p role="status" className="frame-satin-soft rounded-xl bg-surface-overlay/50 px-3.5 py-2.5 text-xs leading-relaxed text-muted-foreground">
          {t(`${K}.empty`)}
        </p>
      )}

      {globalError ? (
        <p role="alert" className="text-xs text-error">
          {errorText(globalError)}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {/* Ẩn khi đã đủ mốc 0 và max: nút disabled không hiện tooltip, chỉ gây thắc mắc "tạo khung là gì". */}
        {!scaffoldDisabled ? (
          <Button type="button" variant="outline" size="lg" onClick={scaffold} title={t(`${K}.scaffoldHint`).replace('{{max}}', String(maxScore))}>
            <Ruler className="size-4" aria-hidden />
            {t(`${K}.scaffold`).replace('{{max}}', String(maxScore))}
          </Button>
        ) : null}
        <Button type="button" variant="outline" size="lg" onClick={addRow} disabled={addDisabled}>
          <Plus className="size-4" aria-hidden />
          {t(`${K}.addLevel`)}
        </Button>
      </div>

      {/* Dính đáy DialogContent (chính nó là scroll container, p-6): 5+ mốc ở màn 900px thì nút Lưu trôi
          xuống dưới mép nhìn thấy — HR tưởng không có nút lưu. Lề âm phủ phần padding của dialog. */}
      <footer className="sticky -bottom-6 -mx-6 -mb-6 flex flex-wrap justify-end gap-2 border-t border-satin bg-surface-elevated px-6 py-4">
        <Button type="button" variant="ghost" size="lg" onClick={onClose}>
          {t(`${K}.cancel`)}
        </Button>
        <Button type="button" size="lg" onClick={save}>
          {t(`${K}.save`)}
        </Button>
      </footer>
    </div>
  );
}
