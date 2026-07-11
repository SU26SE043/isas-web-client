import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { ProfileCompletenessBar } from '@/features/profile/components/ProfileCompletenessBar';

interface InterviewGatePanelProps {
  meetsProfileGate: boolean;
  hasCredits: boolean;
  completenessPercent: number;
  creditsRemaining: number;
}

export const InterviewGatePanel: React.FC<InterviewGatePanelProps> = ({
  meetsProfileGate,
  hasCredits,
  completenessPercent,
  creditsRemaining,
}) => {
  const { t } = useLanguage();

  if (meetsProfileGate && hasCredits) return null;

  return (
    <div className="rounded-xl border border-subtle bg-surface-raised p-6">
      <h2 className="heading-secondary text-lg">{t('practice.flow.gate.title')}</h2>
      <p className="body-text mt-2">{t('practice.flow.gate.description')}</p>

      {!meetsProfileGate ? (
        <div className="mt-4">
          <ProfileCompletenessBar percent={completenessPercent} showGateHint />
          <Link to="/candidate/profile/complete" className="btn-primary mt-4 inline-flex">
            {t('profile.completeness.cta')}
          </Link>
        </div>
      ) : null}

      {!hasCredits ? (
        <div className="mt-4 rounded-lg border border-subtle bg-surface-overlay p-4">
          <p className="text-sm text-foreground">{t('practice.flow.gate.noCredits')}</p>
          <p className="mt-1 text-caption text-muted-foreground">
            {t('practice.flow.gate.creditsRemaining').replace('{count}', String(creditsRemaining))}
          </p>
        </div>
      ) : null}
    </div>
  );
};
