import { Label } from '@/components/ui/label';

interface JobDescriptionTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  helper: string;
  clearLabel: string;
  charsLabel: string;
  wordsLabel: string;
  error?: string | null;
  disabled?: boolean;
  onClear: () => void;
}

function countWords(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function JobDescriptionTextEditor({
  value,
  onChange,
  label,
  placeholder,
  helper,
  clearLabel,
  charsLabel,
  wordsLabel,
  error,
  disabled = false,
  onClear,
}: JobDescriptionTextEditorProps) {
  const chars = value.length;
  const words = countWords(value);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="campaign-jd-text">{label}</Label>
        <textarea
          id="campaign-jd-text"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'campaign-jd-text-error' : 'campaign-jd-text-help'}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[320px] w-full resize-y rounded-2xl border border-satin bg-surface-overlay px-4 py-3 text-sm leading-relaxed text-foreground outline-none transition focus-visible:border-[var(--border-focus)]"
        />
        <p id="campaign-jd-text-help" className="text-xs text-muted-foreground">
          {helper}
        </p>
        {error ? (
          <p id="campaign-jd-text-error" className="text-sm text-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>
          {charsLabel.replace('{count}', String(chars))}
          {' · '}
          {wordsLabel.replace('{count}', String(words))}
        </p>
        <button
          type="button"
          className="btn-ghost text-xs"
          disabled={disabled || !value.trim()}
          onClick={onClear}
        >
          {clearLabel}
        </button>
      </div>
    </div>
  );
}
