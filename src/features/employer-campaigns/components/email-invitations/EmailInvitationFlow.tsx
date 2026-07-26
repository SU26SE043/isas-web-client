import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { EmployerCampaign } from '../../types/campaignManagement.types';
import { EmailInviteCampaignSummary } from './EmailInviteCampaignSummary';
import { EmailInviteConfirmModal } from './EmailInviteConfirmModal';
import { EmailInviteInputs } from './EmailInviteInputs';
import { EmailInviteListPanel } from './EmailInviteListPanel';
import { EmailInviteResultPanel } from './EmailInviteResultPanel';
import { InvitationHistoryPanel } from './InvitationHistoryPanel';
import { useEmailInvitationFlow } from './useEmailInvitationFlow';

type InviteTab = 'send' | 'history';

interface EmailInvitationFlowProps {
  campaign: EmployerCampaign;
  initialEmails?: string[];
  view?: 'combined' | 'send' | 'history';
}

export function EmailInvitationFlow({
  campaign,
  initialEmails = [],
  view = 'combined',
}: EmailInvitationFlowProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const flow = useEmailInvitationFlow(campaign, initialEmails);
  const [tab, setTab] = useState<InviteTab>('send');
  const activeView = view === 'combined' ? tab : view;

  useEffect(() => {
    if (view !== 'send' || flow.step !== 'result' || flow.failed.length > 0) return;
    navigate(`/employer/campaigns/${campaign.id}/invitations`, { replace: true });
  }, [campaign.id, flow.failed.length, flow.step, navigate, view]);

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

  const tabs = (
    <div
      role="tablist"
      aria-label={t('employer.campaigns.campaignInvitations.tabs.listLabel')}
      className="grid gap-2 sm:grid-cols-2"
    >
      {(
        [
          { id: 'send' as const, label: t('employer.campaigns.campaignInvitations.tabs.send') },
          {
            id: 'history' as const,
            label: t('employer.campaigns.campaignInvitations.tabs.history'),
          },
        ] as const
      ).map((item) => {
        const isActive = tab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setTab(item.id)}
            className={cn(
              'rounded-xl px-4 py-3 text-sm font-semibold transition-[background-color,color,box-shadow,border-color] duration-200 ease-out',
              isActive
                ? 'border border-foreground bg-foreground text-background shadow-sm'
                : 'frame-satin bg-surface-raised text-muted-foreground hover:bg-white/[0.04] hover:text-foreground',
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {view === 'combined' ? <header className="space-y-3">
        <nav
          aria-label={t('employer.campaigns.campaignInvitations.breadcrumb.label')}
          className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
        >
          <Link
            to={`/employer/campaigns/${campaign.id}/invite`}
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            {t('employer.campaigns.campaignInvitations.breadcrumb.back')}
          </Link>
          <ChevronRight className="size-3.5 shrink-0 opacity-60" aria-hidden />
          <Link
            to={`/employer/campaigns/${campaign.id}/invite`}
            className="hover:text-foreground"
          >
            {t('employer.campaigns.campaignInvitations.breadcrumb.candidates')}
          </Link>
          <ChevronRight className="size-3.5 shrink-0 opacity-60" aria-hidden />
          <span className="text-foreground">
            {t('employer.campaigns.emailInvitations.title')}
          </span>
        </nav>
        <div className="space-y-1">
          <h1 className="heading-primary text-3xl text-foreground">
            {t('employer.campaigns.emailInvitations.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('employer.campaigns.emailInvitations.description')}
          </p>
        </div>
      </header> : null}

      {view === 'combined' ? tabs : null}

      {activeView === 'history' ? (
        <InvitationHistoryPanel
          campaign={campaign}
          enabled
          onGoToSend={() => setTab('send')}
        />
      ) : flow.step === 'result' ? (
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
            onClose={() => navigate(`/employer/campaigns/${campaign.id}/invitations`)}
            onBackToCampaign={() => navigate(`/employer/campaigns/${campaign.id}`)}
          />
          {confirmModal}
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
