import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { AdminRubricJobCategory, AdminRubricLanguage, AdminRubricMatrixRow } from '../../types/adminApi.types';

interface RubricMatrixChipsProps {
  rows: AdminRubricMatrixRow[] | undefined;
  selected: { category: AdminRubricJobCategory; language: AdminRubricLanguage };
  onSelect: (category: AdminRubricJobCategory, language: AdminRubricLanguage) => void;
}

const CATEGORIES: AdminRubricJobCategory[] = ['FE', 'BE', 'BA'];
const LANGUAGES: AdminRubricLanguage[] = ['vi', 'en'];

/**
 * Ma trận 3 nghề × 2 ngôn ngữ. Rủi ro lớn nhất của màn này không phải "rối" mà là BỎ SÓT — khai
 * xong (BE, vi) rồi quên 5 tổ hợp còn lại; `withLevelsCount` là con số duy nhất trả lời được
 * "còn thiếu ở đâu" (`AdminRubric.cs`). Chip thiếu mốc tô warning để nhìn một lần là thấy.
 */
export function RubricMatrixChips({ rows, selected, onSelect }: RubricMatrixChipsProps) {
  const { t } = useLanguage();
  const byKey = new Map((rows ?? []).map((row) => [`${row.jobCategory}:${row.language}`, row]));
  return (
    <section aria-label={t('admin.rubrics.matrix.title')} className="space-y-2">
      <h2 className="text-sm font-medium text-foreground">{t('admin.rubrics.matrix.title')}</h2>
      <div className="grid gap-2 sm:grid-cols-3">
        {CATEGORIES.map((category) =>
          LANGUAGES.map((language) => {
            const row = byKey.get(`${category}:${language}`);
            const active = selected.category === category && selected.language === language;
            const missing = row ? row.withLevelsCount < row.criteriaCount : false;
            const label = `${t(`admin.rubrics.category.${category}`)} · ${t(`admin.rubrics.lang.${language}`)}`;
            return (
              <button
                key={`${category}:${language}`}
                type="button"
                aria-pressed={active}
                aria-label={label}
                onClick={() => onSelect(category, language)}
                className={cn(
                  'rounded-xl border px-3 py-2 text-left text-sm transition',
                  active ? 'border-foreground/40 bg-white/10 text-foreground' : 'border-satin bg-surface-raised text-muted-foreground hover:text-foreground',
                )}
              >
                <span className="block font-medium text-foreground">{label}</span>
                {row ? (
                  <span className={cn('block text-xs', missing ? 'text-warning' : 'text-muted-foreground')}>
                    {t('admin.rubrics.matrix.cell').replace('{with}', String(row.withLevelsCount)).replace('{total}', String(row.criteriaCount)).replace('{version}', String(row.version))}
                    {' · '}
                    {t(missing ? 'admin.rubrics.matrix.missing' : 'admin.rubrics.matrix.complete')}
                  </span>
                ) : (
                  <span className="block text-xs text-muted-foreground">{t('admin.rubrics.matrix.unknown')}</span>
                )}
              </button>
            );
          }),
        )}
      </div>
    </section>
  );
}
