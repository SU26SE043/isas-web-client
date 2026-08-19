import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type {
  RequirementGroup,
  RequirementItem,
  RequirementMutationResult,
} from '@/features/cv-analysis/hooks/useJdWorkspace';
import { useLanguage } from '@/shared/languages';
import type { JdQuoteRange } from './jdQuoteLocator';
import { JdRequirementMenu, type JdMenuAction } from './JdRequirementMenu';

export interface JdRequirementRowProps {
  item: RequirementItem;
  /** Non-null only when the quote can actually be located in the current JD (X4). */
  quoteRange: JdQuoteRange | null;
  isFlashing: boolean;
  maxChars: number;
  onMove: (id: string, group: RequirementGroup) => void;
  onEdit: (id: string, text: string) => RequirementMutationResult;
  onRemove: (id: string) => void;
  onShowInJd: (range: JdQuoteRange) => void;
}

export function JdRequirementRow({
  item,
  quoteRange,
  isFlashing,
  maxChars,
  onMove,
  onEdit,
  onRemove,
  onShowInJd,
}: JdRequirementRowProps) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(item.text);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const otherGroup: RequirementGroup = item.group === 'must' ? 'nice' : 'must';
  const moveLabel = item.group === 'must' ? t('cv.jd.row.moveToNice') : t('cv.jd.row.moveToMust');
  const quickLabel =
    item.group === 'must' ? t('cv.jd.row.quickMoveNice') : t('cv.jd.row.quickMoveMust');

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const startEditing = () => {
    setDraft(item.text);
    setError(null);
    setIsEditing(true);
  };

  const commit = () => {
    const result = onEdit(item.id, draft);
    if (result.ok) {
      setIsEditing(false);
      setError(null);
      return;
    }
    setError(result.message);
  };

  const actions: JdMenuAction[] = [
    // "Chuyển sang …" comes first on purpose: mis-grouping is the mistake AI
    // makes most often, so the fix must be the first thing under the cursor.
    { key: 'move', label: moveLabel, onSelect: () => onMove(item.id, otherGroup) },
    { key: 'edit', label: t('cv.jd.row.edit'), onSelect: startEditing },
    ...(quoteRange
      ? [
          {
            key: 'quote',
            label: t('cv.jd.row.showInJd'),
            onSelect: () => onShowInJd(quoteRange),
          },
        ]
      : []),
    { key: 'remove', label: t('cv.jd.row.remove'), danger: true, onSelect: () => onRemove(item.id) },
  ];

  return (
    <li
      className={cn(
        'group/row frame-satin-soft rounded-xl bg-white/[0.03] px-3 py-2 transition-colors duration-500',
        isFlashing && 'border-info/50 bg-info/12',
      )}
    >
      {isEditing ? (
        <div className="space-y-2">
          <label className="text-caption block" htmlFor={`jd-req-${item.id}`}>
            {t('cv.jd.row.editLabel')}
          </label>
          <Input
            id={`jd-req-${item.id}`}
            ref={inputRef}
            value={draft}
            maxLength={maxChars}
            aria-invalid={error ? true : undefined}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                commit();
              }
              if (event.key === 'Escape') {
                event.preventDefault();
                setIsEditing(false);
                setError(null);
              }
            }}
          />
          {error ? (
            <p role="alert" className="text-xs text-error">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={commit}>
              {t('cv.jd.row.save')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsEditing(false);
                setError(null);
              }}
            >
              {t('cv.jd.row.cancel')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2">
          <span className="min-w-0 flex-1 py-2 text-sm text-foreground [overflow-wrap:anywhere]">
            {item.text}
          </span>
          {/* Desktop gets one extra shortcut for the most common correction.
              Mobile keeps a single affordance: the menu. */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="hidden shrink-0 opacity-0 transition-opacity group-focus-within/row:opacity-100 group-hover/row:opacity-100 focus-visible:opacity-100 md:inline-flex"
            onClick={() => onMove(item.id, otherGroup)}
          >
            <ArrowRight aria-hidden />
            {quickLabel}
          </Button>
          <JdRequirementMenu label={`${t('cv.jd.row.menu')}: ${item.text}`} actions={actions} />
        </div>
      )}
    </li>
  );
}
