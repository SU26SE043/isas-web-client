import { Link, useParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ArrowRight, MapPin, NotebookText, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/shared/languages';
import { PipelineStageBadge } from '../components/PipelineStageBadge';
import { getCandidateContact, getCandidateDisplay } from '../components/PipelineTable';
import { useEmployerCandidate } from '../hooks/useEmployerAnalytics';

export function EmployerCandidateProfilePage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const { candidate, isLoading } = useEmployerCandidate(id);

  if (isLoading || !candidate) {
    return (
      <div className="h-full overflow-y-auto bg-surface-base">
        <div className="page-container page-section mx-auto max-w-6xl"><Skeleton className="h-96 w-full" /></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-6xl space-y-6">
        <Link to={`/employer/campaigns/${candidate.campaignId}/candidates`} className="text-sm text-muted-foreground hover:text-foreground">
          {t('employerAnalytics.profile.back')}
        </Link>
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-label text-muted-foreground">{t('employerAnalytics.profile.eyebrow')}</p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="heading-primary text-3xl text-foreground">{getCandidateDisplay(candidate)}</h1>
              <PipelineStageBadge stage={candidate.stage} />
            </div>
            <p className="body-text max-w-3xl text-sm text-muted-foreground">{getCandidateContact(candidate)}</p>
          </div>
          <Button render={<Link to={`/employer/candidates/${candidate.id}/report`} />}>
            {t('employerAnalytics.profile.report')} <ArrowRight className="size-4" aria-hidden />
          </Button>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <Info icon={<Timer className="size-4" aria-hidden />} label={t('employerAnalytics.pipeline.score')} value={candidate.score || '-'} />
          <Info icon={<MapPin className="size-4" aria-hidden />} label={t('employerAnalytics.profile.location')} value={candidate.location} />
          <Info icon={<NotebookText className="size-4" aria-hidden />} label={t('employerAnalytics.profile.experience')} value={`${candidate.experienceYears} ${t('employerAnalytics.profile.years')}`} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Card className="border border-subtle bg-surface-raised">
            <CardHeader><CardTitle>{t('employerAnalytics.profile.summary')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{candidate.summary}</p>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill) => <Badge key={skill} variant="outline">{skill}</Badge>)}
              </div>
              <Badge variant="outline" className={candidate.shortlisted ? 'border-success/30 bg-success-bg text-success' : undefined}>
                {candidate.shortlisted ? t('employerAnalytics.profile.shortlisted') : t('employerAnalytics.profile.notShortlisted')}
              </Badge>
            </CardContent>
          </Card>
          <Card className="border border-subtle bg-surface-raised">
            <CardHeader>
              <CardTitle>{t('employerAnalytics.profile.notes')}</CardTitle>
              <p className="text-sm text-muted-foreground">{t('employerAnalytics.profile.notesHint')}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {candidate.internalNotes.map((note) => (
                <div key={note} className="rounded-lg border border-subtle bg-surface-overlay p-3 text-sm text-foreground">{note}</div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
  return (
    <Card className="border border-subtle bg-surface-raised">
      <CardContent className="flex items-center gap-3 p-4">
        <span className="flex size-9 items-center justify-center rounded-lg border border-subtle bg-surface-overlay text-muted-foreground">{icon}</span>
        <span>
          <span className="block text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
          <span className="mt-1 block font-semibold text-foreground">{value}</span>
        </span>
      </CardContent>
    </Card>
  );
}
