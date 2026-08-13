import { Link } from 'react-router-dom';
import { ArrowRight, FileText, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { PipelineCandidate } from '../types/employerAnalytics.types';
import { PipelineStatusBadge } from './PipelineStageBadge';

export function getCandidateDisplay(candidate: PipelineCandidate, blindMode = true) {
  return blindMode ? candidate.candidateCode : candidate.name;
}

export function getCandidateContact(candidate: PipelineCandidate, blindMode = true) {
  return blindMode ? candidate.role : candidate.email;
}

interface PipelineTableProps {
  candidates: PipelineCandidate[];
  blindHiringEnabled?: boolean;
}

export function PipelineTable({ candidates, blindHiringEnabled = true }: PipelineTableProps) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';

  return (
    <>
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('employerAnalytics.pipeline.rank')}</TableHead>
              <TableHead>{t('employerAnalytics.pipeline.candidate')}</TableHead>
              <TableHead className="text-center">{t('employerAnalytics.pipeline.score')}</TableHead>
              <TableHead>{t('employerAnalytics.pipeline.status')}</TableHead>
              <TableHead>{t('employerAnalytics.pipeline.completed')}</TableHead>
              <TableHead className="text-right">{t('employerAnalytics.pipeline.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell className="font-semibold text-foreground">#{candidate.rank}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">
                      {getCandidateDisplay(candidate, blindHiringEnabled)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getCandidateContact(candidate, blindHiringEnabled)} ·{' '}
                      {candidate.skills.slice(0, 2).join(', ')}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-center font-semibold text-foreground">
                  {candidate.score || '—'}
                </TableCell>
                <TableCell>
                  <PipelineStatusBadge status={candidate.status} />
                </TableCell>
                <TableCell>
                  {candidate.completedAt
                    ? new Date(candidate.completedAt).toLocaleDateString(locale)
                    : '—'}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      render={<Link to={`/employer/candidates/${candidate.id}?campaignId=${candidate.campaignId}`} />}
                    >
                      <UserRound className="size-4" aria-hidden />{' '}
                      {t('employerAnalytics.pipeline.viewProfile')}
                    </Button>
                    <Button
                      size="sm"
                      render={<Link to={`/employer/candidates/${candidate.id}/report?campaignId=${candidate.campaignId}`} />}
                    >
                      {t('employerAnalytics.pipeline.viewReport')}{' '}
                      <ArrowRight className="size-4" aria-hidden />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 lg:hidden">
        {candidates.map((candidate) => (
          <Card key={candidate.id} className="border border-satin bg-surface-raised">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    #{candidate.rank}
                  </p>
                  <h2 className="mt-1 text-base font-semibold text-foreground">
                    {getCandidateDisplay(candidate, blindHiringEnabled)}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {getCandidateContact(candidate, blindHiringEnabled)}
                  </p>
                </div>
                <PipelineStatusBadge status={candidate.status} />
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>
                  {t('employerAnalytics.pipeline.score')}: {candidate.score || '-'}
                </span>
                <span>{candidate.skills.slice(0, 3).join(', ')}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  render={<Link to={`/employer/candidates/${candidate.id}?campaignId=${candidate.campaignId}`} />}
                >
                  <FileText className="size-4" aria-hidden />{' '}
                  {t('employerAnalytics.pipeline.viewProfile')}
                </Button>
                <Button render={<Link to={`/employer/candidates/${candidate.id}/report?campaignId=${candidate.campaignId}`} />}>
                  {t('employerAnalytics.pipeline.viewReport')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
