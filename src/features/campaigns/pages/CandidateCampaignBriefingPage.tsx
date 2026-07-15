import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { UserRole } from '@/features/auth/types/auth.types';
import { useLanguage } from '@/shared/languages';
import { CampaignBriefingPanel } from '../components/CampaignBriefingPanel';
import { campaignService } from '../services/campaign.service';
import type { CampaignBriefing } from '../types/campaign.types';

export function CandidateCampaignBriefingPage() {
  const { token = '' } = useParams();
  const { t } = useLanguage();
  const user = useAuthStore((state) => state.user);
  const [briefing, setBriefing] = useState<CampaignBriefing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setNotFound(false);

    void campaignService
      .getCampaignBriefing(token)
      .then((data) => {
        if (!active) return;
        if (!data) {
          setNotFound(true);
          setBriefing(null);
          return;
        }
        if (user?.email && data.candidateEmail.toLowerCase() !== user.email.toLowerCase()) {
          setNotFound(true);
          setBriefing(null);
          return;
        }
        setBriefing(data);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token, user?.email]);

  if (!user || user.role !== UserRole.CANDIDATE) {
    return <Navigate to="/access-denied" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-surface-base">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  if (notFound || !briefing) {
    return (
      <div className="page-container page-section mx-auto max-w-3xl space-y-4 py-12 text-center">
        <h1 className="heading-primary text-2xl text-foreground">{t('campaigns.invite.notFound')}</h1>
        <p className="text-sm text-muted-foreground">{t('campaigns.invite.notFoundHint')}</p>
        <Link to="/candidate/campaigns" className="btn-secondary inline-flex">
          {t('campaigns.my.backToList')}
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-4xl space-y-4 py-6">
        <Link to="/candidate/campaigns" className="text-sm text-muted-foreground hover:text-foreground">
          {t('campaigns.my.backToList')}
        </Link>
        <CampaignBriefingPanel briefing={briefing} />
      </div>
    </div>
  );
}
