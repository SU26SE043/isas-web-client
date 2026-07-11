import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/shared/languages';
import type { EmployerActivity } from '../types/employer.types';

function formatDate(date: string, language: 'vi' | 'en') {
  return new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

export function EmployerActivityList({ activities }: { activities: EmployerActivity[] }) {
  const { t, language } = useLanguage();

  return (
    <Card className="border border-subtle bg-surface-raised">
      <CardHeader>
        <CardTitle>{t('employer.dashboard.activity')}</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="rounded-lg border border-subtle bg-surface-overlay px-4 py-6 text-center text-sm text-muted-foreground">
            {t('employer.dashboard.noActivity')}
          </p>
        ) : (
          <ol className="space-y-4">
            {activities.slice(0, 5).map((activity) => (
              <li key={activity.id} className="border-l border-subtle pl-4">
                <p className="text-sm font-medium text-foreground">
                  {language === 'vi' ? activity.titleVi : activity.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {language === 'vi' ? activity.descriptionVi : activity.description}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">{formatDate(activity.createdAt, language)}</p>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
