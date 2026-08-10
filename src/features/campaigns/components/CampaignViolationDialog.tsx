import { Loader2, TriangleAlert } from 'lucide-react';
import { AppModal } from '@/components/ui/app-modal';
import { useLanguage } from '@/shared/languages';
import type { CampaignViolation } from '../types/campaignViolation.types';

interface CampaignViolationDialogProps {
  violation: CampaignViolation | null;
  pendingCount: number;
  recovering: boolean;
  recoveryError: string | null;
  onContinue: () => void;
}

const MESSAGE_KEYS = {
  tab_switch: 'campaigns.violation.tabSwitch',
  fullscreen_exit: 'campaigns.violation.fullscreenExit',
  focus_lost: 'campaigns.violation.focusLost',
  paste: 'campaigns.violation.paste',
  camera_blocked: 'campaigns.violation.cameraBlocked',
  no_face: 'campaigns.violation.noFace',
  multiple_faces: 'campaigns.violation.multipleFaces',
  face_mismatch: 'campaigns.violation.faceMismatch',
  identity_unverified: 'campaigns.violation.identityUnverified',
} as const;

export function CampaignViolationDialog({
  violation,
  pendingCount,
  recovering,
  recoveryError,
  onContinue,
}: CampaignViolationDialogProps) {
  const { t } = useLanguage();
  const isIdentityIssue = violation?.kind === 'identity_unverified';

  return (
    <AppModal
      open={Boolean(violation)}
      onClose={() => undefined}
      size="md"
      showCloseButton={false}
      closeOnBackdrop={false}
      closeOnEscape={false}
      ariaLabel={t(isIdentityIssue
        ? 'campaigns.violation.identityTitle'
        : 'campaigns.violation.title')}
      contentClassName="border-warning/40 bg-surface-elevated"
      overlayClassName="z-[80] bg-black/85"
      className="z-[90]"
    >
      {violation ? (
        <div className="p-1">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full border border-warning/40 bg-warning/10 text-warning">
              <TriangleAlert className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {t(isIdentityIssue
                  ? 'campaigns.violation.identityTitle'
                  : 'campaigns.violation.title')}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t(MESSAGE_KEYS[violation.kind])}
              </p>
            </div>
          </div>

          {pendingCount > 0 ? (
            <p className="mt-4 text-xs text-warning">
              {t('campaigns.violation.pending').replace('{count}', String(pendingCount))}
            </p>
          ) : null}
          {recoveryError ? (
            <p className="mt-4 text-sm text-error" role="alert">{t(recoveryError)}</p>
          ) : null}

          <button
            type="button"
            className="btn-primary mt-6 inline-flex w-full items-center justify-center gap-2"
            disabled={recovering}
            onClick={onContinue}
          >
            {recovering ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {t(isIdentityIssue
              ? 'campaigns.violation.retry'
              : 'campaigns.violation.continue')}
          </button>
        </div>
      ) : null}
    </AppModal>
  );
}
