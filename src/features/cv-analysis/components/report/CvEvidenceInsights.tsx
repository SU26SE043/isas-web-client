import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, SearchX } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { CvAnalysisResult, RequirementMatch } from '../../types/cvAnalysis.types';
import { groupRequirementEvidence } from '../../utils/cvEvidence';
import { CvRequirementEvidenceItem } from './CvRequirementEvidenceItem';

interface CvEvidenceInsightsProps {
  analysis: CvAnalysisResult;
  onViewCv: (match: RequirementMatch) => void;
}

function EvidenceColumn({
  title,
  description,
  icon,
  matches,
  openId,
  onToggle,
  onViewCv,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  matches: RequirementMatch[];
  openId: string | null;
  onToggle: (id: string) => void;
  onViewCv: (match: RequirementMatch) => void;
}) {
  const { t } = useLanguage();
  return (
    <section className="frame-satin rounded-3xl bg-surface-raised p-5 sm:p-6">
      <div className="flex items-start gap-3">
        {icon}
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {matches.length ? matches.map((match) => (
          <CvRequirementEvidenceItem
            key={match.requirementId}
            match={match}
            isOpen={openId === match.requirementId}
            onToggle={() => onToggle(match.requirementId)}
            onViewCv={onViewCv}
          />
        )) : <p className="text-sm text-muted-foreground">{t('cv.report.evidence.emptyGroup')}</p>}
      </div>
    </section>
  );
}

export function CvEvidenceInsights({ analysis, onViewCv }: CvEvidenceInsightsProps) {
  const { t } = useLanguage();
  const [openId, setOpenId] = useState<string | null>(null);
  const groups = useMemo(() => groupRequirementEvidence(analysis), [analysis]);
  const total = groups.strengths.length + groups.gaps.length;
  const toggle = (id: string) => setOpenId((current) => current === id ? null : id);

  if (total === 0) {
    return (
      <section className="frame-satin rounded-3xl bg-surface-raised p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning">
            <SearchX className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{t('cv.report.evidence.title')}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {t('cv.report.evidence.legacyDescription')}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5" aria-labelledby="cv-evidence-title">
      <div className="space-y-2">
        <p className="text-label text-muted-foreground">{t('cv.report.evidence.kicker')}</p>
        <h2 id="cv-evidence-title" className="heading-secondary text-2xl text-foreground">
          {t('cv.report.evidence.title')}
        </h2>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          {t('cv.report.evidence.description')}
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <EvidenceColumn
          title={t('cv.report.strengths')}
          description={t('cv.report.evidence.strengthDescription')}
          icon={<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-success/15 text-success"><CheckCircle2 className="size-5" /></span>}
          matches={groups.strengths}
          openId={openId}
          onToggle={toggle}
          onViewCv={onViewCv}
        />
        <EvidenceColumn
          title={t('cv.report.weaknesses')}
          description={t('cv.report.evidence.gapDescription')}
          icon={<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning"><AlertTriangle className="size-5" /></span>}
          matches={groups.gaps}
          openId={openId}
          onToggle={toggle}
          onViewCv={onViewCv}
        />
      </div>
    </section>
  );
}
