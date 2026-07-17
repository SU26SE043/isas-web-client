import React from 'react';
import { Calendar, Mail, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import { getProfileInitials } from './getProfileInitials';

interface CandidateProfileHeaderProps {
  fullName: string;
  title?: string;
  email: string;
  memberSince: string;
  cvCount: number;
  jdCount: number;
}

function formatMemberSince(value: string, locale: 'vi' | 'en') {
  return new Date(value).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function StatBox({
  label,
  count,
  unitLabel,
}: {
  label: string;
  count: number;
  unitLabel: string;
}) {
  return (
    <div className="frame-satin min-w-[120px] rounded-lg bg-surface-overlay px-4 py-3 text-center">
      <p className="text-label text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{count}</p>
      <p className="text-xs text-muted-foreground">{unitLabel}</p>
    </div>
  );
}

export const CandidateProfileHeader: React.FC<CandidateProfileHeaderProps> = ({
  fullName,
  title,
  email,
  memberSince,
  cvCount,
  jdCount,
}) => {
  const { t, language } = useLanguage();
  const initials = getProfileInitials(fullName);
  const roleLabel = title?.trim() || t('profile.view.notSet');

  return (
    <Card className="border border-subtle bg-surface-raised">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
            <div
              className="frame-satin flex size-20 shrink-0 items-center justify-center rounded-full bg-surface-overlay sm:size-24"
              aria-hidden
            >
              <span className="text-2xl font-semibold text-foreground sm:text-3xl">{initials}</span>
            </div>

            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="heading-primary truncate text-xl text-foreground sm:text-2xl">
                  {fullName}
                </h2>
                <Badge
                  variant="outline"
                  className={cn(
                    'border-satin bg-white/[0.04] text-foreground',
                    !title?.trim() && 'text-muted-foreground',
                  )}
                >
                  {roleLabel}
                </Badge>
              </div>

              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{email}</span>
              </p>

              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="size-4 shrink-0" aria-hidden />
                <span>
                  {t('profile.view.joinedFrom').replace(
                    '{date}',
                    formatMemberSince(memberSince, language),
                  )}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 lg:justify-end">
            <StatBox
              label={t('profile.view.statCvFiles')}
              count={cvCount}
              unitLabel={t('profile.view.fileCountUnit')}
            />
            <StatBox
              label={t('profile.view.statJdFiles')}
              count={jdCount}
              unitLabel={t('profile.view.fileCountUnit')}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function ProfilePageHeader({
  onEditClick,
}: {
  onEditClick: () => void;
}) {
  const { t } = useLanguage();

  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <p className="text-label text-muted-foreground">{t('profile.breadcrumb')}</p>
        <h1 className="heading-primary text-2xl text-foreground">{t('profile.view.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('profile.view.subtitleSimple')}</p>
      </div>
      <button
        type="button"
        onClick={onEditClick}
        className="btn-secondary inline-flex w-full shrink-0 items-center justify-center gap-2 sm:w-auto"
      >
        <Pencil className="size-4" aria-hidden />
        {t('profile.editProfile')}
      </button>
    </header>
  );
}
