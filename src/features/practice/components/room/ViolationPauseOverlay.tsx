import React from 'react';
import { useLanguage } from '@/shared/languages';
import type { ViolationType } from '../../types/proctoring.types';

interface ViolationPauseOverlayProps {
  visible: boolean;
  reason?: ViolationType;
  violationCount: number;
  maxViolations: number;
  onContinue: () => void;
}

const REASON_KEYS: Record<ViolationType, string> = {
  tab_switch: 'practice.room.violationReasonTab',
  focus_loss: 'practice.room.violationReasonFocus',
  face_mismatch: 'practice.room.violationReasonFace',
};

export const ViolationPauseOverlay: React.FC<ViolationPauseOverlayProps> = ({
  visible,
  reason,
  violationCount,
  maxViolations,
  onContinue,
}) => {
  const { t } = useLanguage();

  if (!visible) return null;

  const reasonKey = reason ? REASON_KEYS[reason] : 'practice.room.violationReasonGeneric';

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/85 px-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="violation-pause-title"
        className="max-w-md rounded-xl border border-warning-500/40 bg-surface-elevated p-6 text-center"
      >
        <h2 id="violation-pause-title" className="heading-secondary text-lg text-foreground">
          {t('practice.room.violationPauseTitle')}
        </h2>
        <p className="body-text mt-2">{t(reasonKey)}</p>
        <p className="mt-4 text-sm text-muted-foreground">
          {t('practice.room.violationCount')
            .replace('{current}', String(violationCount))
            .replace('{max}', String(maxViolations))}
        </p>
        <button type="button" className="btn-primary mt-6" onClick={onContinue}>
          {t('practice.room.violationContinue')}
        </button>
      </div>
    </div>
  );
};

