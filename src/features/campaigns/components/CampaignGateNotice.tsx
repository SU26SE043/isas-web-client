import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';

interface CampaignGateNoticeProps {
  percent: number;
  meetsGate: boolean;
}

export function CampaignGateNotice({ percent, meetsGate }: CampaignGateNoticeProps) {
  const { t } = useLanguage();
  return (
    <Card className="border border-subtle bg-surface-raised">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          {meetsGate ? (
            <CheckCircle2 className="mt-0.5 size-5 text-emerald-400" aria-hidden />
          ) : (
            <AlertTriangle className="mt-0.5 size-5 text-amber-400" aria-hidden />
          )}
          <div>
            <p className="font-medium text-foreground">
              {meetsGate ? t('campaigns.enroll.gateReady') : t('campaigns.enroll.gateBlocked')}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('campaigns.enroll.gatePercent').replace('{percent}', String(percent))}
            </p>
          </div>
        </div>
        {!meetsGate ? (
          <Link to="/candidate/profile/complete" className={cn(buttonVariants({ variant: 'secondary' }), 'w-full sm:w-auto')}>
            {t('campaigns.enroll.completeProfile')}
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}
