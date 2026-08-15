import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { UserRole } from '@/features/auth/types/auth.types';
import { authTokenStorage } from '@/shared/api/authTokenStorage';
import { useLanguage } from '@/shared/languages';
import { InviteExpiredState } from '../components/InviteExpiredState';
import { campaignService } from '../services/campaign.service';
import type { CampaignInvite } from '../types/campaign.types';

export function LegacyMagicLinkLandingPage() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.isLoading);
  const [invite, setInvite] = useState<(CampaignInvite & { campaign: unknown }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void campaignService.validateMagicLink(token).then((result) => {
      if (active) {
        setInvite(result);
        setIsLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [token]);

  const hasPersistedToken = Boolean(authTokenStorage.getAccessToken());

  if (!hasHydrated || isLoading || authLoading || (hasPersistedToken && !user)) {
    return (
      <div className="page-container page-section flex min-h-[70vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">{t('ds.loading.page')}</span>
      </div>
    );
  }

  if (!invite) {
    return <div className="page-container page-section min-h-[70vh]"><InviteExpiredState variant="invalid" /></div>;
  }

  if (invite.status === 'expired') {
    return <div className="page-container page-section min-h-[70vh]"><InviteExpiredState variant="expired" /></div>;
  }

  if (!isAuthenticated || !user) {
    navigate('/login', { replace: true, state: { from: { pathname: `/invite/${token}` } } });
    return null;
  }

  if (user.role !== UserRole.CANDIDATE) {
    return <Navigate to="/access-denied" replace />;
  }

  if (user.email.toLowerCase() !== invite.candidateEmail.toLowerCase()) {
    return <div className="page-container page-section min-h-[70vh]"><InviteExpiredState variant="invalid" /></div>;
  }

  return <Navigate to={`/candidate/campaigns?highlight=${encodeURIComponent(token)}`} replace />;
}
