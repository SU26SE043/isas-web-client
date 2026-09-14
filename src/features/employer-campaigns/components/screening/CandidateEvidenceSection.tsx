import { useLanguage } from '@/shared/languages';
import type { CampaignCandidateDetail, CandidateEvidence } from '../../types/campaign.api.types';

export function CandidateEvidenceSection({ detail }: { detail: CampaignCandidateDetail }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-4">
      {detail.fitSummary ? (
        <section>
          <h4 className="text-sm font-medium text-foreground">{t('employer.campaigns.screening.detail.fitSummary')}</h4>
          <p className="mt-1 text-sm text-muted-foreground">{detail.fitSummary}</p>
        </section>
      ) : null}
      {detail.eligible === false || detail.mustHaveTotal ? <section className="rounded-lg border border-warning/30 bg-warning-bg/10 p-3"><h4 className="text-sm font-medium text-foreground">{t('employer.campaigns.screening.detail.eliminationConditions')}</h4><p className="mt-1 text-sm text-muted-foreground">{detail.mustHaveMet ?? 0}/{detail.mustHaveTotal ?? 0}</p>{detail.missingMustHave?.length ? <p className="mt-1 text-sm text-warning">{t('employer.campaigns.screening.detail.missingConditions')}: {detail.missingMustHave.join(', ')}</p> : null}</section> : null}
      <EvidenceGroup title={t('employer.campaigns.screening.detail.strengths')} items={detail.strengths} />
      <EvidenceGroup title={t('employer.campaigns.screening.detail.gaps')} items={detail.gaps} />
      {detail.bonusSignals.length > 0 ? (
        <section>
          <h4 className="text-sm font-medium text-foreground">{t('employer.campaigns.screening.detail.bonusSignals')}</h4>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {detail.bonusSignals.map((signal) => <li key={signal}>{signal}</li>)}
          </ul>
        </section>
      ) : null}
      {detail.verifyQuestions.length > 0 ? (
        <section>
          <h4 className="text-sm font-medium text-foreground">{t('employer.campaigns.screening.detail.verifyQuestions')}</h4>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {detail.verifyQuestions.map((question) => <li key={question}>{question}</li>)}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function EvidenceGroup({ title, items }: { title: string; items: CandidateEvidence[] }) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-2">
      <h4 className="text-sm font-medium text-foreground">{title}</h4>
      {items.map((item) => (
        <div key={`${item.needId}-${item.area}`} className="rounded-lg border border-satin bg-surface-overlay px-3 py-2">
          <div className="flex items-start gap-2"><p className="min-w-0 flex-1 border-l-2 border-satin pl-3 text-sm text-foreground">“{item.evidence}”</p><span className="shrink-0 rounded-full border border-satin px-2 py-0.5 text-xs text-muted-foreground">{item.level}</span></div>
          <p className="mt-2 text-xs text-muted-foreground">{item.area}</p>
        </div>
      ))}
    </section>
  );
}
