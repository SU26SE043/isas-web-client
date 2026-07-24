import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '@/features/auth/services/authService';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { UserRole } from '@/features/auth/types/auth.types';
import { authTokenStorage } from '@/shared/api/authTokenStorage';
import { useLanguage } from '@/shared/languages';
import { InvitationDetailPanel } from '../components/InvitationDetailPanel';
import { InviteExpiredState } from '../components/InviteExpiredState';
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
    return error.message || t('campaigns.invite.joinUnknown');
  }
  return t('campaigns.invite.joinUnknown');
}

export function MagicLinkLandingPage() {
  const { token = '' } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const authLoading = useAuthStore((state) => state.isLoading);
  const [authHydrated, setAuthHydrated] = useState(() => useAuthStore.persist.hasHydrated());
  const [loadState, setLoadState] = useState<InviteLoadState>({ status: 'loading' });
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const joinStartedRef = useRef(false);

  const invitePath = invitationPath(token);
  const canJoin = isAuthenticated && user?.role === UserRole.CANDIDATE;

  useEffect(() => {
    return useAuthStore.persist.onFinishHydration(() => setAuthHydrated(true));
  }, []);

  useEffect(() => {
    let active = true;
    setLoadState({ status: 'loading' });
    setJoinError(null);
    joinStartedRef.current = false;

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
      navigate(
        `/candidate/campaigns?highlight=${encodeURIComponent(result.campaignId)}`,
        { replace: true },
      );
    } catch (error) {
      joinStartedRef.current = false;
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
    if (loadState.status !== 'ready' || !canJoin || isJoining) return;
    const pending = readPendingInviteToken();
    if (!pending || pending !== token.trim()) return;
    void performJoin();
  }, [canJoin, isJoining, loadState.status, performJoin, token]);

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
    return (
      <div className="page-container page-section flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-rose-400" role="alert">
          {loadState.message}
        </p>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => window.location.reload()}
        >
          {t('campaigns.invite.retryLoad')}
        </button>
        <Link to="/" className="text-sm text-zinc-400 underline-offset-4 hover:underline">
          {t('campaigns.invite.home')}
        </Link>
      </div>
    );
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
        <p className="mx-auto max-w-3xl text-center text-sm text-zinc-500">
          {t('campaigns.invite.authRequiredHint')}{' '}
          <Link
            to="/login"
            state={{ from: { pathname: invitePath } }}
            className="font-medium text-zinc-100 underline-offset-4 hover:underline"
            onClick={() => savePendingInviteToken(token)}
          >
            {t('campaigns.invite.signIn')}
          </Link>
          {' · '}
          <Link
            to="/register"
            state={{ from: { pathname: invitePath } }}
            className="font-medium text-zinc-100 underline-offset-4 hover:underline"
            onClick={() => savePendingInviteToken(token)}
          >
            {t('campaigns.invite.register')}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
