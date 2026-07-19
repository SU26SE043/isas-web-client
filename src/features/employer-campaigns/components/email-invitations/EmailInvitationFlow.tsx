import { Link, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/shared/languages';
import type { EmployerCampaign } from '../../types/campaignManagement.types';
import { EmailInviteCampaignSummary } from './EmailInviteCampaignSummary';
import { EmailInviteConfirmModal } from './EmailInviteConfirmModal';
import { EmailInviteInputs } from './EmailInviteInputs';
import { EmailInviteListPanel } from './EmailInviteListPanel';
import { EmailInviteResultPanel } from './EmailInviteResultPanel';
import { useEmailInvitationFlow } from './useEmailInvitationFlow';

interface EmailInvitationFlowProps {
  campaign: EmployerCampaign;
  initialEmails?: string[];
}

export function EmailInvitationFlow({ campaign, initialEmails = [] }: EmailInvitationFlowProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const flow = useEmailInvitationFlow(campaign, initialEmails);

  const confirmModal = (
    <EmailInviteConfirmModal
      open={flow.confirmOpen}
      campaignTitle={campaign.title}
      emails={flow.retryEmails}
      isConfirming={flow.isSending}
      onCancel={flow.closeConfirm}
      onConfirm={() => void flow.sendInvitations()}
    />
  );

  if (flow.step === 'result') {
    return (
      <>
        <EmailInviteResultPanel
          created={flow.created}
          failed={flow.failed}
          isRetrying={flow.isSending}
          onRetryFailed={() =>
            flow.openConfirm(
              flow.failed.map((item) => item.email),
              true,
            )
          }
          onInviteMore={flow.inviteMore}
          onClose={() => navigate(`/employer/campaigns/${campaign.id}/invite`)}
          onBackToCampaign={() => navigate(`/employer/campaigns/${campaign.id}`)}
        />
        {confirmModal}
      </>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <Link
          to={`/employer/campaigns/${campaign.id}/invite`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {t('employer.campaigns.inviteFlow.backToMethod')}
        </Link>
        <h1 className="heading-primary text-3xl text-foreground">
          {t('employer.campaigns.emailInvitations.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('employer.campaigns.emailInvitations.description')}
        </p>
      </header>

      {!flow.isActive ? (
        <Alert variant="warning">
          <AlertDescription>
            {t('employer.campaigns.emailInvitations.errors.campaignNotActive')}
          </AlertDescription>
        </Alert>
      ) : null}

      {flow.formError ? (
        <Alert variant="error">
          <AlertDescription>{flow.formError}</AlertDescription>
        </Alert>
      ) : null}

      <EmailInviteCampaignSummary campaign={campaign} />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-satin bg-surface-overlay p-4">
          <EmailInviteInputs
            disabled={!flow.isActive || flow.isSending}
            onAddSingle={flow.addSingle}
            onAddBulk={flow.addBulk}
          />
        </section>
        <EmailInviteListPanel
          validEmails={flow.validEmails}
          invalidEmails={flow.invalidEmails}
          duplicateEmails={flow.duplicateEmails}
          disabled={!flow.isActive}
          canSend={flow.canSend}
          isSending={flow.isSending}
          capacityWarning={flow.capacityWarning}
          onRemove={flow.removeEmail}
          onClearAll={flow.clearAll}
          onClearInvalid={flow.clearInvalid}
          onSend={() => flow.openConfirm(flow.validEmails, false)}
        />
      </div>

      {confirmModal}
    </div>
  );
}
