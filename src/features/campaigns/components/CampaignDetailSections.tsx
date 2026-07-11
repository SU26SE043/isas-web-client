import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/shared/languages';
import type { Campaign } from '../types/campaign.types';

function BulletSection({ title, items }: { title: string; items: string[] }) {
  return (
    <Card className="border border-subtle bg-surface-raised">
      <CardHeader>
        <CardTitle className="text-base text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 size-1.5 rounded-full bg-muted-foreground" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function CampaignDetailSections({ campaign }: { campaign: Campaign }) {
  const { t } = useLanguage();
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <BulletSection title={t('campaigns.detail.responsibilities')} items={campaign.responsibilities} />
        <BulletSection title={t('campaigns.detail.requirements')} items={campaign.requirements} />
        <BulletSection title={t('campaigns.detail.benefits')} items={campaign.benefits} />
      </div>
      <aside className="space-y-4">
        <Card className="border border-subtle bg-surface-raised">
          <CardHeader>
            <CardTitle className="text-base text-foreground">{t('campaigns.detail.skills')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {campaign.skills.map((skill) => (
              <Badge key={skill} variant="outline" className="border-subtle bg-surface-overlay text-muted-foreground">
                {skill}
              </Badge>
            ))}
          </CardContent>
        </Card>
        <Card className="border border-subtle bg-surface-raised">
          <CardHeader>
            <CardTitle className="text-base text-foreground">{t('campaigns.detail.process')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {campaign.process.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-xs text-foreground">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
