import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/shared/languages';
import type { User } from '@/features/auth/types/auth.types';

interface ProfileBasicInfoCardProps {
  user: User;
}

function formatMemberSince(value: string, locale: 'vi' | 'en') {
  return new Date(value).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function ProfileBasicInfoCard({ user }: ProfileBasicInfoCardProps) {
  const { t, language } = useLanguage();

  const rows = [
    { label: t('profile.view.name'), value: user.fullName },
    { label: t('profile.view.email'), value: user.email },
    { label: t('profile.view.titleLabel'), value: user.title || t('profile.view.notSet') },
    { label: t('profile.view.location'), value: user.location || t('profile.view.notSet') },
    {
      label: t('profile.view.memberSince'),
      value: formatMemberSince(user.createdAt, language),
    },
  ];

  return (
    <Card className="border border-subtle bg-surface-raised">
      <CardContent className="space-y-4 p-5 sm:p-6">
        <h2 className="heading-secondary text-lg text-foreground">{t('profile.view.basicInfo')}</h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label} className="space-y-1">
              <dt className="text-label text-muted-foreground">{row.label}</dt>
              <dd className="text-sm text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
