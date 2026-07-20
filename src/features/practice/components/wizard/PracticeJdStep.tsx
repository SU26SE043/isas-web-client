import { FileText } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { FileRecord } from '@/features/cv-analysis/types/cvAnalysis.types';
import { PRACTICE_JD_TEXT_MAX_CHARS } from '../../types/b2cPracticeSession.types';
import { PracticeWizardNav } from './PracticeWizardNav';
import { PracticeWizardOptionCard } from './PracticeWizardOptionCard';
import { PracticeWizardStepCard } from './PracticeWizardStepCard';

interface PracticeJdStepProps {
  tab: 'file' | 'text';
  onTabChange: (tab: 'file' | 'text') => void;
  files: FileRecord[];
  selectedJdId: string | null;
  jdText: string;
  isLoading: boolean;
  disabled?: boolean;
  textTooLong: boolean;
  onSelectJd: (id: string | null) => void;
  onJdTextChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function PracticeJdStep({
  tab,
  onTabChange,
  files,
  selectedJdId,
  jdText,
  isLoading,
  disabled,
  textTooLong,
  onSelectJd,
  onJdTextChange,
  onBack,
  onNext,
}: PracticeJdStepProps) {
  const { t } = useLanguage();
  const count = jdText.trim().length;

  return (
    <PracticeWizardStepCard
      icon={<FileText className="size-4" aria-hidden />}
      title={t('practice.setup.jd.title')}
      description={t('practice.setup.jd.description')}
      isLoading={isLoading && tab === 'file' && files.length === 0}
      footer={
        <PracticeWizardNav
          onBack={onBack}
          onNext={onNext}
          nextDisabled={disabled || textTooLong}
        />
      }
    >
      <div className="mb-4 flex gap-2" role="tablist" aria-label={t('practice.setup.jd.title')}>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'file'}
          className={cn(
            'rounded-xl px-4 py-2 text-sm font-medium',
            tab === 'file' ? 'btn-primary' : 'btn-secondary',
          )}
          onClick={() => onTabChange('file')}
          disabled={disabled}
        >
          {t('practice.setup.jd.tabFile')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'text'}
          className={cn(
            'rounded-xl px-4 py-2 text-sm font-medium',
            tab === 'text' ? 'btn-primary' : 'btn-secondary',
          )}
          onClick={() => onTabChange('text')}
          disabled={disabled}
        >
          {t('practice.setup.jd.tabText')}
        </button>
      </div>

      <p className="mb-4 text-xs text-muted-foreground">{t('practice.setup.jd.hint')}</p>

      {tab === 'file' ? (
        <div className="grid gap-3">
          <PracticeWizardOptionCard
            title={t('practice.setup.jd.noJd')}
            description={t('practice.setup.jd.noJdHint')}
            selected={selectedJdId === null}
            onClick={() => onSelectJd(null)}
            disabled={disabled}
          />
          {files.map((file) => (
            <PracticeWizardOptionCard
              key={file.id}
              title={file.originalName}
              description={`${Math.round(file.fileSize / 1024)} KB · ${file.parsedStatus}`}
              selected={selectedJdId === file.id}
              onClick={() => onSelectJd(file.id)}
              disabled={disabled}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <label htmlFor="practice-jd-text" className="sr-only">
            {t('practice.setup.jd.tabText')}
          </label>
          <textarea
            id="practice-jd-text"
            className="min-h-[220px] w-full rounded-xl border border-satin bg-surface-overlay px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground"
            placeholder={t('practice.setup.jd.placeholder')}
            value={jdText}
            onChange={(e) => onJdTextChange(e.target.value)}
            disabled={disabled}
            maxLength={PRACTICE_JD_TEXT_MAX_CHARS + 500}
          />
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className={textTooLong ? 'text-error' : 'text-muted-foreground'}>
              {count.toLocaleString()} / {PRACTICE_JD_TEXT_MAX_CHARS.toLocaleString()}
            </span>
            {textTooLong ? (
              <span className="text-error" role="alert">
                {t('practice.errors.jdTooLong')}
              </span>
            ) : null}
          </div>
        </div>
      )}
    </PracticeWizardStepCard>
  );
}
