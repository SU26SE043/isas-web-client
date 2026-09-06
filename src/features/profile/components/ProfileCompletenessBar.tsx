import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { PROFILE_COMPLETENESS_GATE } from '../utils/completeness';

interface ProfileCompletenessBarProps {
  percent: number;
  showGateHint?: boolean;
  className?: string;
}

export const ProfileCompletenessBar: React.FC<ProfileCompletenessBarProps> = ({
  percent,
  showGateHint = false,
  className = '',
}) => {
  const { t } = useLanguage();
  const clamped = Math.max(0, Math.min(100, percent));
  const meetsGate = clamped >= PROFILE_COMPLETENESS_GATE;

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-label text-muted-foreground">{t('profile.completeness.label')}</span>
        <span className="text-sm font-semibold text-foreground">{clamped}%</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-surface-overlay"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t('profile.completeness.label')}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${meetsGate ? 'bg-success' : 'bg-foreground'}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showGateHint ? (
        <p className={`mt-2 text-caption ${meetsGate ? 'text-success' : 'text-muted-foreground'}`}>
          {meetsGate ? t('profile.completeness.gateMet') : t('profile.completeness.gateHint')}
        </p>
      ) : null}
    </div>
  );
};

interface ProfileCompletenessCtaProps {
  percent: number;
}

export const ProfileCompletenessCta: React.FC<ProfileCompletenessCtaProps> = ({ percent }) => {
  const { t } = useLanguage();
  const meetsGate = percent >= PROFILE_COMPLETENESS_GATE;

  if (meetsGate) return null;

  return (
    <div className="rounded-xl border border-subtle bg-surface-raised p-4">
      <ProfileCompletenessBar percent={percent} showGateHint />
      <Link to="/candidate/profile/complete" className="btn-primary mt-4 inline-flex">
        {t('profile.completeness.cta')}
      </Link>
    </div>
  );
};
