import { Briefcase, Mail, MapPin, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/shared/languages';
import type { User as AuthUser } from '@/features/auth/types/auth.types';

interface ProfileBasicInfoCardProps {
  user: AuthUser;
}

interface InfoRow {
  icon: LucideIcon;
  label: string;
  value: string;
}

export function ProfileBasicInfoCard({ user }: ProfileBasicInfoCardProps) {
  const { t } = useLanguage();

  const rows: InfoRow[] = [
    { icon: User, label: t('profile.view.name'), value: user.fullName || t('profile.view.notSet') },
    { icon: Mail, label: t('profile.view.email'), value: user.email },
    {
      icon: Briefcase,
      label: t('profile.view.titleLabel'),
      value: user.title || t('profile.view.notSet'),
    },
    {
      icon: MapPin,
      label: t('profile.view.location'),
      value: user.location || t('profile.view.notSet'),
    },
  ];

  return (
    <Card className="border border-subtle bg-surface-raised">
      <CardContent className="space-y-4 p-5 sm:p-6">
        <h2 className="heading-secondary text-lg text-foreground">{t('profile.view.basicInfo')}</h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label} className="flex gap-3">
              <span className="frame-satin-soft flex size-9 shrink-0 items-center justify-center rounded-md bg-white/[0.04] text-muted-foreground">
                <row.icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 space-y-1">
                <dt className="text-label text-muted-foreground">{row.label}</dt>
                <dd className="text-sm text-foreground">{row.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
