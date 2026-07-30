import { useLanguage } from '@/shared/languages';
import { CV_JD_TEXT_MAX_CHARS } from '../../utils/buildCreateCvAnalysisRequest';

interface CvJdTextPanelProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CvJdTextPanel({ value, onChange, disabled = false }: CvJdTextPanelProps) {
  const { t } = useLanguage();
  const count = value.trim().length;
  const tooLong = count > CV_JD_TEXT_MAX_CHARS;

  return (
    <div className="space-y-2">
      <label htmlFor="cv-jd-text" className="text-sm font-medium text-foreground">
        {t('cv.jdTextLabel')}
      </label>
      <textarea
        id="cv-jd-text"
        rows={8}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t('cv.jdTextPlaceholder')}
        className="w-full resize-y rounded-xl border border-subtle bg-surface-overlay px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
      />
      <p className={tooLong ? 'text-xs text-error' : 'text-xs text-muted-foreground'}>
        {count.toLocaleString()} / {CV_JD_TEXT_MAX_CHARS.toLocaleString()}
      </p>
    </div>
  );
}
