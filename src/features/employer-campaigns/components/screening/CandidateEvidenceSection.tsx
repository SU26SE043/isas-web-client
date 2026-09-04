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
      <EvidenceGroup t={t} title={t('employer.campaigns.screening.detail.strengths')} items={detail.strengths} />
      <EvidenceGroup t={t} title={t('employer.campaigns.screening.detail.gaps')} items={detail.gaps} />
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

function EvidenceGroup({ t, title, items }: { t: (key: string) => string; title: string; items: CandidateEvidence[] }) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-2">
      <h4 className="text-sm font-medium text-foreground">{title}</h4>
      {items.map((item) => (
        <div key={`${item.needId}-${item.area}`} className="rounded-lg border border-satin bg-surface-overlay px-3 py-2">
          <p className="text-sm font-medium text-foreground">{item.area} · {item.level}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t(`employer.campaigns.screening.detail.level.${item.level.toLowerCase()}`)} · <span className="italic">“{item.evidence}”</span></p>
        </div>
      ))}
    </section>
  );
}
