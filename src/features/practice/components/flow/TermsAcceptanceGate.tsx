import React from 'react';
import { useLanguage } from '@/shared/languages';

interface TermsAcceptanceGateProps {
  accepted: boolean;
  onAcceptedChange: (value: boolean) => void;
}

export const TermsAcceptanceGate: React.FC<TermsAcceptanceGateProps> = ({
  accepted,
  onAcceptedChange,
}) => {
  const { t } = useLanguage();

  return (
    <div className="rounded-xl border border-subtle bg-surface-raised p-6">
      <h2 className="heading-secondary text-lg">{t('practice.flow.terms.title')}</h2>
      <p className="body-text mt-3">{t('practice.flow.terms.description')}</p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        <li>{t('practice.flow.terms.ruleCamera')}</li>
        <li>{t('practice.flow.terms.ruleProctoring')}</li>
        <li>{t('practice.flow.terms.ruleData')}</li>
      </ul>
      <label className="mt-6 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 size-4 rounded border-default bg-surface-overlay"
          checked={accepted}
          onChange={(event) => onAcceptedChange(event.target.checked)}
        />
        <span className="text-sm text-foreground">{t('practice.flow.terms.acceptLabel')}</span>
      </label>
    </div>
  );
};
