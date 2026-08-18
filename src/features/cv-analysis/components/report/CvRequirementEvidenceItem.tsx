import { AlertTriangle, CheckCircle2, ChevronDown, FileSearch, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { RequirementMatch } from '../../types/cvAnalysis.types';
import { hasVerifiedCvEvidence } from '../../utils/cvEvidence';

interface CvRequirementEvidenceItemProps {
  match: RequirementMatch;
  isOpen: boolean;
  onToggle: () => void;
  onViewCv: (match: RequirementMatch) => void;
}

export function CvRequirementEvidenceItem({
  match,
  isOpen,
  onToggle,
  onViewCv,
}: CvRequirementEvidenceItemProps) {
  const { t } = useLanguage();
  const isStrength = match.level !== 'Weak';
  const hasEvidence = hasVerifiedCvEvidence(match);
  const panelId = `cv-evidence-${match.requirementId}`;

  return (
    <article className="frame-satin-interactive overflow-hidden rounded-2xl bg-surface-overlay/70">
      <button
        type="button"
        className="flex w-full items-start gap-3 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span
          className={cn(
            'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg',
            isStrength ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning',
          )}
        >
          {isStrength ? <CheckCircle2 className="size-4" /> : <AlertTriangle className="size-4" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold leading-6 text-foreground">{match.text}</span>
          <span className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>{t(`cv.report.priority.${match.priority}`)}</span>
            <span aria-hidden>·</span>
            <span>{t(`cv.report.level.${match.level}`)}</span>
          </span>
        </span>
        <ChevronDown
          className={cn('mt-1 size-4 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-180')}
          aria-hidden
        />
      </button>

      {isOpen ? (
        <div id={panelId} className="border-t border-satin/60 px-4 py-4">
          {hasEvidence ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-satin bg-surface-raised p-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <Quote className="size-3.5" aria-hidden />
                  {t('cv.report.evidence.quote')}
                </div>
                <blockquote className="mt-2 text-sm leading-6 text-foreground">“{match.evidence}”</blockquote>
                <p className="mt-3 text-xs text-muted-foreground">
                  {match.sectionTitle || t('cv.report.evidence.unknownSection')}
                  {match.page ? ` · ${t('cv.report.evidence.page')} ${match.page}` : ''}
                </p>
              </div>
              <Button type="button" variant="outline" onClick={() => onViewCv(match)}>
                <FileSearch className="size-4" aria-hidden />
                {t('cv.report.evidence.viewInCv')}
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-warning/30 bg-warning-bg px-4 py-3 text-sm">
              <p className="font-medium text-foreground">{t('cv.report.evidence.notFoundTitle')}</p>
              <p className="mt-1 leading-6 text-muted-foreground">{t('cv.report.evidence.notFoundDescription')}</p>
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}
