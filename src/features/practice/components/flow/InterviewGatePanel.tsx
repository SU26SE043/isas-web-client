import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { ProfileCompletenessBar } from '@/features/profile/components/ProfileCompletenessBar';

interface InterviewGatePanelProps {
  meetsProfileGate: boolean;
  hasCredits: boolean;
  completenessPercent: number;
  creditsRemaining: number;
  reserveEstimate?: number;
}

export const InterviewGatePanel: React.FC<InterviewGatePanelProps> = ({
  meetsProfileGate,
  hasCredits,
  completenessPercent,
  creditsRemaining,
  reserveEstimate = 0,
}) => {
  const { t } = useLanguage();

  if (meetsProfileGate && hasCredits) return null;

  return (
    <div className="frame-satin rounded-2xl bg-surface-raised/80 p-6">
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
        <div className="mt-4 frame-satin rounded-xl bg-white/[0.03] p-4">
          <p className="text-sm text-foreground">{t('practice.flow.gate.noTokens')}</p>
          <p className="mt-1 text-caption text-muted-foreground">
            {t('practice.flow.gate.tokensAvailable')
              .replace('{available}', creditsRemaining.toLocaleString())
              .replace('{reserve}', reserveEstimate.toLocaleString())}
          </p>
          <Link to="/candidate/credits" className="btn-primary mt-4 inline-flex">
            {t('payment.wallet.buyTokens')}
          </Link>
        </div>
      ) : null}
    </div>
  );
};
