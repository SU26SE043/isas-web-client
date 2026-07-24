import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { readCampaignInterviewSession } from '../utils/campaignInterviewSession';

/** Temporary shell until face-enroll / room slices land. */
export function CampaignInterviewRouteShell({ kind }: { kind: 'face-enroll' | 'interview' | 'completed' }) {
  const { campaignId = '', sessionId = '' } = useParams();
  const { t } = useLanguage();
  const stored = readCampaignInterviewSession(sessionId);

  const titleKey =
    kind === 'face-enroll'
      ? 'campaigns.flow.faceEnrollTitle'
      : kind === 'interview'
        ? 'campaigns.flow.interviewTitle'
        : 'campaigns.flow.completedTitle';

  return (
    <div className="page-container page-section mx-auto max-w-3xl space-y-4 py-10">
      <h1 className="heading-primary text-2xl text-foreground">{t(titleKey)}</h1>
      <p className="text-sm text-muted-foreground">{t('campaigns.flow.preparingHint')}</p>
      <dl className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm">
        <div>
          <dt className="text-zinc-500">{t('campaigns.detail.sessionId')}</dt>
          <dd className="text-zinc-100">{sessionId || '—'}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Campaign</dt>
          <dd className="text-zinc-100">{campaignId || stored?.campaignId || '—'}</dd>
        </div>
      </dl>
      <Link
        to={`/candidate/campaigns/${encodeURIComponent(campaignId || stored?.campaignId || '')}`}
        className="btn-secondary inline-flex"
      >
        {t('campaigns.my.backToList')}
      </Link>
    </div>
  );
}
