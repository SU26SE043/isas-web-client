import { Link } from 'react-router-dom';
import { ArrowRight, FileText, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { PipelineCandidate } from '../types/employerAnalytics.types';
import { PipelineStatusBadge } from './PipelineStageBadge';

interface PipelineTableProps {
  candidates: PipelineCandidate[];
}

export function getCandidateDisplay(candidate: PipelineCandidate) {
  return candidate.blindHiring ? candidate.candidateCode : candidate.name;
}

export function getCandidateContact(candidate: PipelineCandidate) {
  return candidate.blindHiring ? candidate.role : candidate.email;
}

export function PipelineTable({ candidates }: PipelineTableProps) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';

  return (
    <>
      <Card className="hidden border border-subtle bg-surface-raised lg:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-subtle">
                <TableHead>{t('employerAnalytics.pipeline.rank')}</TableHead>
                <TableHead>{t('employerAnalytics.pipeline.candidate')}</TableHead>
                <TableHead>{t('employerAnalytics.pipeline.score')}</TableHead>
                <TableHead>{t('employerAnalytics.pipeline.status')}</TableHead>
                <TableHead>{t('employerAnalytics.pipeline.completed')}</TableHead>
                <TableHead className="text-right">{t('employerAnalytics.pipeline.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.id} className="border-subtle">
                  <TableCell className="font-semibold text-foreground">#{candidate.rank}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{getCandidateDisplay(candidate)}</p>
                      <p className="text-xs text-muted-foreground">{getCandidateContact(candidate)} · {candidate.skills.slice(0, 2).join(', ')}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">{candidate.score || '-'}</TableCell>
                  <TableCell><PipelineStatusBadge status={candidate.status} /></TableCell>
                  <TableCell className="text-muted-foreground">
                    {candidate.completedAt ? new Date(candidate.completedAt).toLocaleDateString(locale) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" render={<Link to={`/employer/candidates/${candidate.id}`} />}>
                        <UserRound className="size-4" aria-hidden /> {t('employerAnalytics.pipeline.viewProfile')}
                      </Button>
                      <Button size="sm" render={<Link to={`/employer/candidates/${candidate.id}/report`} />}>
                        {t('employerAnalytics.pipeline.viewReport')} <ArrowRight className="size-4" aria-hidden />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-3 lg:hidden">
        {candidates.map((candidate) => (
          <Card key={candidate.id} className="border border-subtle bg-surface-raised">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">#{candidate.rank}</p>
                  <h2 className="mt-1 text-base font-semibold text-foreground">{getCandidateDisplay(candidate)}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{getCandidateContact(candidate)}</p>
                </div>
                <PipelineStatusBadge status={candidate.status} />
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>{t('employerAnalytics.pipeline.score')}: {candidate.score || '-'}</span>
                <span>{candidate.skills.slice(0, 3).join(', ')}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" render={<Link to={`/employer/candidates/${candidate.id}`} />}>
                  <FileText className="size-4" aria-hidden /> {t('employerAnalytics.pipeline.viewProfile')}
                </Button>
                <Button render={<Link to={`/employer/candidates/${candidate.id}/report`} />}>
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
