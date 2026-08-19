import { useEffect, useId, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type {
  RequirementGroup,
  RequirementMutationResult,
} from '@/features/cv-analysis/hooks/useJdWorkspace';
import { useLanguage } from '@/shared/languages';

export interface JdRequirementComposerProps {
  maxChars: number;
  atLimit: boolean;
  maxRequirements: number;
  onAdd: (text: string, group: RequirementGroup) => RequirementMutationResult;
  onClose: () => void;
}

/**
 * Stays open after each add, clears the input and keeps the group that was
 * chosen — typing five must-haves is one flow, not five round trips.
 */
export function JdRequirementComposer({
  maxChars,
  atLimit,
  maxRequirements,
  onAdd,
  onClose,
}: JdRequirementComposerProps) {
  const { t } = useLanguage();
  const groupId = useId();
  const textId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [group, setGroup] = useState<RequirementGroup>('must');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = () => {
    if (atLimit) return;
    // `message` arrives already translated from the workspace — render it as is.
    const result = onAdd(text, group);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setText('');
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <div
      className="frame-satin-soft rounded-xl bg-white/[0.04] p-3"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose();
        }
      }}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="sm:w-40">
          <label htmlFor={groupId} className="text-caption mb-1 block">
            {t('cv.jd.composer.groupLabel')}
          </label>
          <select
            id={groupId}
            value={group}
            disabled={atLimit}
            onChange={(event) => setGroup(event.target.value as RequirementGroup)}
            className="h-11 w-full rounded-xl border border-satin bg-surface-overlay/80 px-3 text-sm text-foreground shadow-[var(--satin-inset)] outline-none focus-visible:border-[var(--border-focus)] disabled:opacity-50"
          >
            <option value="must">{t('cv.jd.requirements.mustHave')}</option>
            <option value="nice">{t('cv.jd.requirements.niceToHave')}</option>
          </select>
        </div>

        <div className="min-w-0 flex-1">
          <label htmlFor={textId} className="text-caption mb-1 block">
            {t('cv.jd.composer.textLabel')}
          </label>
          <Input
            id={textId}
            ref={inputRef}
            value={text}
            maxLength={maxChars}
            disabled={atLimit}
            placeholder={t('cv.jd.composer.placeholder')}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${textId}-error` : undefined}
            className="h-11"
            onChange={(event) => {
              setText(event.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;
              event.preventDefault();
              submit();
            }}
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            size="lg"
            className="min-h-11 flex-1 sm:flex-none"
            disabled={atLimit}
            onClick={submit}
          >
            <Plus aria-hidden />
            {t('cv.jd.composer.submit')}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="ghost"
            className="min-h-11"
            onClick={onClose}
          >
            {t('cv.jd.composer.close')}
          </Button>
        </div>
      </div>

      {error ? (
        <p id={`${textId}-error`} role="alert" className="mt-2 text-xs text-error">
          {error}
        </p>
      ) : null}

      <p className="mt-2 text-xs text-muted-foreground">
        {atLimit
          ? t('cv.jd.requirements.limitReached').replace('{max}', String(maxRequirements))
          : t('cv.jd.composer.hint')}
      </p>
    </div>
  );
}
