import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { UserRole } from '@/features/auth/types/auth.types';
import { useLanguage } from '@/shared/languages';
import { InvitationDetailPanel } from '../components/InvitationDetailPanel';
import { InviteExpiredState } from '../components/InviteExpiredState';
import {
  CampaignCandidateError,
  campaignCandidateService,
} from '../services/campaignCandidate.service';
import type { CampaignInvitationResponse } from '../types/campaignCandidate.types';
import {
  invitationPath,
  savePendingInviteToken,
} from '../utils/inviteContinuation';

type InviteLoadState =
  | { status: 'loading' }
  | { status: 'ready'; invitation: CampaignInvitationResponse }
  | { status: 'notFound' }
  | { status: 'gone' }
  | { status: 'error'; message: string };

export function MagicLinkLandingPage() {
  const { token = '' } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.isLoading);
  const [authHydrated, setAuthHydrated] = useState(() => useAuthStore.persist.hasHydrated());
  const [loadState, setLoadState] = useState<InviteLoadState>({ status: 'loading' });

  const invitePath = invitationPath(token);

  useEffect(() => {
    return useAuthStore.persist.onFinishHydration(() => setAuthHydrated(true));
  }, []);

  useEffect(() => {
    let active = true;
    setLoadState({ status: 'loading' });

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

  const handleJoin = useCallback(() => {
    if (!token.trim()) return;
    savePendingInviteToken(token);

    if (!isAuthenticated || user?.role !== UserRole.CANDIDATE) {
      navigate('/login', { state: { from: { pathname: invitePath } } });
      return;
    }

    // Join POST is wired in the next slice; keep token and stay for continuation.
    navigate(invitePath, { replace: true, state: { pendingJoin: true } });
  }, [invitePath, isAuthenticated, navigate, token, user?.role]);

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
          onClick={() => {
            setLoadState({ status: 'loading' });
            void campaignCandidateService
              .getInvitationByToken(token)
              .then((invitation) => setLoadState({ status: 'ready', invitation }))
              .catch((error: unknown) => {
                if (error instanceof CampaignCandidateError && error.code === 'notFound') {
                  setLoadState({ status: 'notFound' });
                  return;
                }
                if (error instanceof CampaignCandidateError && error.code === 'gone') {
                  setLoadState({ status: 'gone' });
                  return;
                }
                setLoadState({
                  status: 'error',
                  message:
                    error instanceof Error ? error.message : t('campaigns.invite.loadError'),
                });
              });
          }}
        >
          {t('campaigns.invite.retryLoad')}
        </button>
        <Link to="/" className="text-sm text-zinc-400 underline-offset-4 hover:underline">
          {t('campaigns.invite.home')}
        </Link>
      </div>
    );
  }

  const needsAuth = !isAuthenticated || user?.role !== UserRole.CANDIDATE;

  return (
    <div className="page-container page-section min-h-[70vh] space-y-6 py-8">
      <InvitationDetailPanel
        invitation={loadState.invitation}
        onJoin={handleJoin}
        joinDisabled={false}
      />

      {needsAuth ? (
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
