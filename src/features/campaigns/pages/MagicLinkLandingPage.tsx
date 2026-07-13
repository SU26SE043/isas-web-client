import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { UserRole } from '@/features/auth/types/auth.types';
import { useLanguage } from '@/shared/languages';
import { AuthBranch } from '../components/AuthBranch';
import { CampaignBriefingPanel } from '../components/CampaignBriefingPanel';
import { InviteExpiredState } from '../components/InviteExpiredState';
import { InviteLandingPanel } from '../components/InviteLandingPanel';
import { campaignService } from '../services/campaign.service';
import type { CampaignBriefing, InviteAuthResolution } from '../types/campaign.types';

function emailsMatch(left?: string, right?: string) {
  return Boolean(left && right && left.toLowerCase() === right.toLowerCase());
}

export function MagicLinkLandingPage() {
  const { token = '' } = useParams();
  const { t } = useLanguage();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.isLoading);
  const invitePath = `/invite/${token}`;
  const [inviteLoading, setInviteLoading] = useState(true);
  const [authHydrated, setAuthHydrated] = useState(() => useAuthStore.persist.hasHydrated());
  const [authResolution, setAuthResolution] = useState<InviteAuthResolution | null>(null);
  const [briefing, setBriefing] = useState<CampaignBriefing | null>(null);

  useEffect(() => {
    return useAuthStore.persist.onFinishHydration(() => setAuthHydrated(true));
  }, []);

  useEffect(() => {
    let active = true;
    setInviteLoading(true);

    void Promise.all([campaignService.validateMagicLink(token), campaignService.resolveInviteAuth(token)])
      .then(([_, resolution]) => {
        if (active) setAuthResolution(resolution);
      })
      .finally(() => {
        if (active) setInviteLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    const invite = authResolution?.invite;
    if (!invite || invite.status !== 'valid') {
      setBriefing(null);
      return;
    }
    if (authResolution.mode === 'role_blocked' || authResolution.mode === 'invalid') {
      setBriefing(null);
      return;
    }
    if (!authHydrated || authLoading) {
      return;
    }
    if (!isAuthenticated || user?.role !== UserRole.CANDIDATE) {
      setBriefing(null);
      return;
    }
    if (!emailsMatch(user.email, invite.candidateEmail)) {
      setBriefing(null);
      return;
    }

    let active = true;
    void campaignService.getCampaignBriefing(token).then((data) => {
      if (active) setBriefing(data);
    });

    return () => {
      active = false;
    };
  }, [authHydrated, authLoading, authResolution, isAuthenticated, token, user?.email, user?.role]);

  const isLoading = inviteLoading || !authHydrated || authLoading;

  if (isLoading) {
    return (
      <div className="page-container page-section flex min-h-[70vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">{t('ds.loading.page')}</span>
      </div>
    );
  }

  if (!authResolution?.invite) {
    return (
      <div className="page-container page-section min-h-[70vh]">
        <InviteExpiredState variant="invalid" />
      </div>
    );
  }

  if (authResolution.invite.status === 'expired') {
    return (
      <div className="page-container page-section min-h-[70vh]">
        <InviteExpiredState variant="expired" />
      </div>
    );
  }

  const showBriefing =
    Boolean(briefing) &&
    isAuthenticated &&
    user?.role === UserRole.CANDIDATE &&
    emailsMatch(user.email, authResolution.invite.candidateEmail);

  return (
    <div className="page-container page-section min-h-[70vh] space-y-6">
      {!showBriefing ? <InviteLandingPanel invite={authResolution.invite} /> : null}

      {!showBriefing ? (
        <AuthBranch
          mode={authResolution.mode}
          candidateEmail={authResolution.invite.candidateEmail}
          invitePath={invitePath}
          isAuthenticated={isAuthenticated}
          currentEmail={user?.email}
        />
      ) : null}

      {showBriefing && briefing ? <CampaignBriefingPanel briefing={briefing} /> : null}

      {!showBriefing && isAuthenticated && user?.role !== UserRole.CANDIDATE ? (
        <p className="text-center text-sm text-muted-foreground">
          <Link to={invitePath} className="text-foreground underline">
            {t('campaigns.invite.retry')}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
