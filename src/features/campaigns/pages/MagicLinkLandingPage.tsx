import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '@/features/auth/services/authService';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { UserRole } from '@/features/auth/types/auth.types';
import { authTokenStorage } from '@/shared/api/authTokenStorage';
import { useLanguage } from '@/shared/languages';
import { isPlaywrightRuntime } from '@/shared/mock/config';
import { InvitationDetailPanel } from '../components/InvitationDetailPanel';
import { InviteExpiredState } from '../components/InviteExpiredState';
import { InvitationAuthHint } from '../components/InvitationAuthHint';
import { InvitationEmailMismatchState } from '../components/InvitationEmailMismatchState';
import { InvitationLoadErrorState } from '../components/InvitationLoadErrorState';
import { MY_CAMPAIGNS_QUERY_KEY } from '../hooks/useMyCampaigns';
import {
  CampaignCandidateError,
  campaignCandidateService,
} from '../services/campaignCandidate.service';
import type { CampaignInvitationResponse } from '../types/campaignCandidate.types';
import {
  clearPendingInviteToken,
  invitationPath,
  readPendingInviteToken,
  savePendingInviteToken,
} from '../utils/inviteContinuation';
import { LegacyMagicLinkLandingPage } from './LegacyMagicLinkLandingPage';

type InviteLoadState =
  | { status: 'loading' }
  | { status: 'ready'; invitation: CampaignInvitationResponse }
  | { status: 'notFound' }
  | { status: 'gone' }
  | { status: 'error'; message: string };

function joinErrorMessage(error: unknown, t: (key: string) => string): string {
  if (error instanceof CampaignCandidateError) {
    if (error.code === 'notFound') return t('campaigns.invite.joinNotFound');
    if (error.code === 'gone') return t('campaigns.invite.joinGone');
    if (error.code === 'identityError') return t('campaigns.invite.joinIdentityError');
    if (error.code === 'forbidden') return t('campaigns.invite.joinForbidden');
    return error.message || t('campaigns.invite.joinUnknown');
  }
  return t('campaigns.invite.joinUnknown');
}

function LiveMagicLinkLandingPage() {
  const { token = '' } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const authLoading = useAuthStore((state) => state.isLoading);
  const [authHydrated, setAuthHydrated] = useState(() => useAuthStore.persist.hasHydrated());
  const [loadState, setLoadState] = useState<InviteLoadState>({ status: 'loading' });
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [hasEmailMismatch, setHasEmailMismatch] = useState(false);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
  const joinStartedRef = useRef(false);
  const autoJoinAttemptedRef = useRef(false);

  const invitePath = invitationPath(token);
  const canJoin = isAuthenticated && user?.role === UserRole.CANDIDATE;

  useEffect(() => {
    return useAuthStore.persist.onFinishHydration(() => setAuthHydrated(true));
  }, []);

  useEffect(() => {
    let active = true;
    setLoadState({ status: 'loading' });
    setJoinError(null);
    setHasEmailMismatch(false);
    joinStartedRef.current = false;
    autoJoinAttemptedRef.current = false;

    void campaignCandidateService
      .getInvitationByToken(token)
      .then((invitation) => {
        if (active) setLoadState({ status: 'ready', invitation });
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof CampaignCandidateError) {
          if (error.code === 'notFound') {
            setLoadState({ status: 'notFound' });
            return;
          }
          if (error.code === 'gone') {
            setLoadState({ status: 'gone' });
            return;
          }
          setLoadState({ status: 'error', message: error.message });
          return;
        }
        setLoadState({ status: 'error', message: t('campaigns.invite.loadError') });
      });

    return () => {
      active = false;
    };
  }, [token, t]);

  const performJoin = useCallback(async () => {
    if (!token.trim() || joinStartedRef.current) return;
    joinStartedRef.current = true;
    setIsJoining(true);
    setJoinError(null);
    setHasEmailMismatch(false);
    savePendingInviteToken(token);

    try {
      const result = await campaignCandidateService.joinCampaignByToken(token);
      authTokenStorage.setAccessToken(result.accessToken);

      try {
        const me = await authService.me();
        setUser(me);
      } catch {
        /* keep existing user if /me fails after token swap */
      }

      clearPendingInviteToken();
      await queryClient.invalidateQueries({ queryKey: MY_CAMPAIGNS_QUERY_KEY });
      toast.success(t('campaigns.invite.joinSuccess'));
      navigate(`/candidate/campaigns/${encodeURIComponent(result.campaignId)}`, { replace: true });
    } catch (error) {
      joinStartedRef.current = false;
      if (error instanceof CampaignCandidateError && error.code === 'emailMismatch') {
        setHasEmailMismatch(true);
        return;
      }
      setJoinError(joinErrorMessage(error, t));
      if (error instanceof CampaignCandidateError && error.code === 'gone') {
        setLoadState({ status: 'gone' });
      }
      if (error instanceof CampaignCandidateError && error.code === 'notFound') {
        setLoadState({ status: 'notFound' });
      }
    } finally {
      setIsJoining(false);
    }
  }, [navigate, queryClient, setUser, t, token]);

  const handleJoin = useCallback(() => {
    if (!token.trim()) return;
    savePendingInviteToken(token);

    if (!canJoin) {
      navigate('/login', { state: { from: { pathname: invitePath } } });
      return;
    }

    void performJoin();
  }, [canJoin, invitePath, navigate, performJoin, token]);

  useEffect(() => {
    if (loadState.status !== 'ready' || !canJoin || isJoining || hasEmailMismatch) return;
    if (autoJoinAttemptedRef.current) return;
    const pending = readPendingInviteToken();
    if (!pending || pending !== token.trim()) return;
    autoJoinAttemptedRef.current = true;
    void performJoin();
  }, [canJoin, hasEmailMismatch, isJoining, loadState.status, performJoin, token]);

  const handleSwitchAccount = useCallback(async () => {
    if (!token.trim() || isSwitchingAccount) return;
    setIsSwitchingAccount(true);
    savePendingInviteToken(token);

    const refreshToken = authTokenStorage.getRefreshToken();
    logout();
    await authService.logout(refreshToken).catch(() => undefined);
    navigate('/login', { state: { from: { pathname: invitePath } } });
  }, [invitePath, isSwitchingAccount, logout, navigate, token]);

  const isBootstrapping = !authHydrated || authLoading;

  if (isBootstrapping || loadState.status === 'loading') {
    return (
      <div className="page-container page-section flex min-h-[70vh] items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="text-sm text-muted-foreground">{t('campaigns.invite.loading')}</span>
      </div>
    );
  }

  if (loadState.status === 'notFound') {
    return (
      <div className="page-container page-section min-h-[70vh]">
        <InviteExpiredState variant="invalid" />
      </div>
    );
  }

  if (loadState.status === 'gone') {
    return (
      <div className="page-container page-section min-h-[70vh]">
        <InviteExpiredState variant="expired" />
      </div>
    );
  }

  if (loadState.status === 'error') {
    return <InvitationLoadErrorState message={loadState.message} />;
  }

  return (
    <div className="page-container page-section min-h-[70vh] space-y-6 py-8">
      <InvitationDetailPanel
        invitation={loadState.invitation}
        onJoin={handleJoin}
        isJoining={isJoining}
        joinDisabled={isJoining}
        joinError={joinError}
      />

      {!canJoin ? (
        <InvitationAuthHint
          invitePath={invitePath}
          token={token}
          onSavePendingToken={savePendingInviteToken}
        />
      ) : null}
      {hasEmailMismatch ? (
        <InvitationEmailMismatchState
          currentEmail={user?.email}
          isSwitchingAccount={isSwitchingAccount}
          onSwitchAccount={() => void handleSwitchAccount()}
        />
      ) : null}
    </div>
  );
}

export function MagicLinkLandingPage() {
  return isPlaywrightRuntime() ? <LegacyMagicLinkLandingPage /> : <LiveMagicLinkLandingPage />;
}
