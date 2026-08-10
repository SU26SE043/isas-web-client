import { useState } from 'react';
import { ArrowRight, CheckCircle2, ExternalLink, GitBranch, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/shared/languages';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { repoAnalysisService, RepoAnalysisError } from '../services/repoAnalysis.service';
import type { RepoAnalysisResponse } from '../types/repoAnalysis.types';

const categories = ['FE', 'BE', 'BA'];
const listKey = ['repo-analysis', 'list'];

function errorKey(error: unknown): string {
  return error instanceof RepoAnalysisError ? `repo.error.${error.code}` : 'repo.error.unknown';
}

function ReportSection({ title, items }: { title: string; items: string[] }) {
  return items.length ? <section className="space-y-2"><h3 className="text-sm font-semibold text-foreground">{title}</h3><ul className="space-y-2 text-sm text-muted-foreground">{items.map((item) => <li key={item} className="flex gap-2"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />{item}</li>)}</ul></section> : null;
}

function ReportCard({ report, t }: { report: RepoAnalysisResponse; t: (key: string) => string }) {
  return <Card className="border-primary/30 bg-card/95">
    <CardHeader className="border-b border-border/60">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="mb-1 text-xs uppercase tracking-[0.18em] text-primary">{t('repo.reportTitle')}</p><CardTitle className="flex items-center gap-2 text-xl"><GitBranch className="size-5" />{report.repoOwner}/{report.repoName}</CardTitle></div><a className="btn-secondary inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm" href={report.repoUrl} target="_blank" rel="noreferrer">{t('repo.view')}<ExternalLink className="size-4" /></a></div>
      <div className="flex flex-wrap gap-3 pt-2 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><Star className="size-3.5 text-amber-400" />{report.stars} {t('repo.stars')}</span><span>{t('repo.language')}: {report.primaryLanguage || '—'}</span><span>{t('repo.categoryLabel')}: {report.jobCategory}</span></div>
    </CardHeader>
    <CardContent className="space-y-6 pt-5"><div><h3 className="mb-2 text-sm font-semibold text-foreground">{t('repo.summary')}</h3><p className="text-sm leading-6 text-muted-foreground">{report.summary || '—'}</p></div>
      {report.techStack.length ? <div><h3 className="mb-2 text-sm font-semibold text-foreground">{t('repo.techStack')}</h3><div className="flex flex-wrap gap-2">{report.techStack.map((item) => <span key={item} className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-foreground">{item}</span>)}</div></div> : null}
      <div className="grid gap-5 md:grid-cols-2"><ReportSection title={t('repo.strengths')} items={report.strengths} /><ReportSection title={t('repo.weaknesses')} items={report.weaknesses} /><ReportSection title={t('repo.suggestions')} items={report.suggestions} /><ReportSection title={t('repo.talkingPoints')} items={report.interviewTalkingPoints} /></div>
      {report.jdMatch ? <div className="rounded-xl border border-primary/20 bg-primary/5 p-4"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">{t('repo.jdMatch')}</h3><span className="text-lg font-semibold text-primary">{report.jdMatch.score}%</span></div><div className="mt-3 grid gap-4 md:grid-cols-2"><ReportSection title={t('repo.matchedSkills')} items={report.jdMatch.matchedSkills} /><ReportSection title={t('repo.missingSkills')} items={report.jdMatch.missingSkills} /></div></div> : null}
    </CardContent>
  </Card>;
}

export function RepoAnalysisPage() {
  const { t } = useLanguage();
  usePageTitle(t('repo.pageTitle'));
  const queryClient = useQueryClient();
  const [repoUrl, setRepoUrl] = useState('');
  const [jobCategory, setJobCategory] = useState('FE');
  const [jdText, setJdText] = useState('');
  const [selected, setSelected] = useState<RepoAnalysisResponse | null>(null);
  const [cursor, setCursor] = useState<string | undefined>();
  const [history, setHistory] = useState<RepoAnalysisResponse[]>([]);
  const list = useQuery({ queryKey: [...listKey, cursor], queryFn: () => repoAnalysisService.listPage({ cursor, limit: 6 }), retry: false });
  const create = useMutation({ mutationFn: () => repoAnalysisService.create({ repoUrl, jobCategory, jdText }), onSuccess: (data) => { setSelected(data); setRepoUrl(''); setJdText(''); void queryClient.invalidateQueries({ queryKey: listKey }); } });
  const reports = cursor ? [...history, ...(list.data?.items ?? [])] : (list.data?.items ?? []);
  const onLoadMore = () => { if (list.data?.nextCursor) { setHistory(reports); setCursor(list.data.nextCursor); } };

  return <div className="h-full overflow-y-auto bg-surface-page"><div className="page-container page-section mx-auto max-w-7xl space-y-6">
    <header className="space-y-2"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary"><GitBranch className="size-4" />BC18 · GitHub</div><h1 className="heading-primary text-3xl text-foreground">{t('repo.pageTitle')}</h1><p className="body-text max-w-3xl text-sm text-muted-foreground">{t('repo.description')}</p></header>
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card><CardHeader><CardTitle>{t('repo.formTitle')}</CardTitle><CardDescription>{t('repo.formDescription')}</CardDescription></CardHeader><CardContent><form className="space-y-5" onSubmit={(event) => { event.preventDefault(); create.mutate(); }}>
        <label className="block space-y-2 text-sm font-medium" htmlFor="repo-url">{t('repo.urlLabel')}<Input id="repo-url" value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} placeholder={t('repo.urlPlaceholder')} aria-invalid={create.isError} /></label>
        <fieldset className="space-y-2"><legend className="text-sm font-medium">{t('repo.categoryLabel')}</legend><div className="grid grid-cols-3 gap-2">{categories.map((category) => <button key={category} type="button" onClick={() => setJobCategory(category)} className={`rounded-xl border px-3 py-2.5 text-sm transition-colors ${jobCategory === category ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/50'}`}>{t(`repo.category.${category.toLowerCase()}`)}</button>)}</div></fieldset>
        <label className="block space-y-2 text-sm font-medium" htmlFor="repo-jd">{t('repo.jdLabel')} <span className="font-normal text-muted-foreground">({t('repo.optional')})</span><textarea id="repo-jd" value={jdText} onChange={(event) => setJdText(event.target.value)} placeholder={t('repo.jdPlaceholder')} rows={5} className="w-full resize-y rounded-xl border border-satin bg-surface-overlay/80 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-[var(--border-focus)] focus:ring-3 focus:ring-white/10" /></label>
        {create.isError ? <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{t(errorKey(create.error))}</p> : null}
        <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-muted-foreground">{t('repo.creditHint')}</span><Button type="submit" loading={create.isPending}>{t('repo.analyze')}<ArrowRight /></Button></div>
      </form></CardContent></Card>
      <Card><CardHeader><CardTitle>{t('repo.howTitle')}</CardTitle></CardHeader><CardContent className="space-y-5">{[['repo.step1', 'repo.step1Desc'], ['repo.step2', 'repo.step2Desc'], ['repo.step3', 'repo.step3Desc']].map(([title, description]) => <div key={title} className="flex gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" /><div><p className="text-sm font-medium">{t(title)}</p><p className="mt-1 text-sm leading-5 text-muted-foreground">{t(description)}</p></div></div>)}</CardContent></Card>
    </div>
    {selected ? <ReportCard report={selected} t={t} /> : null}
    <Card><CardHeader><CardTitle>{t('repo.historyTitle')}</CardTitle></CardHeader><CardContent>{list.isLoading ? <p className="text-sm text-muted-foreground">{t('repo.historyLoading')}</p> : reports.length ? <div className="space-y-2">{reports.map((report) => <button key={report.id} type="button" onClick={() => setSelected(report)} className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/20 p-4 text-left transition-colors hover:border-primary/50"><span><span className="block text-sm font-medium text-foreground">{report.repoOwner}/{report.repoName}</span><span className="mt-1 block text-xs text-muted-foreground">{report.jobCategory} · {report.primaryLanguage || '—'}</span></span><ArrowRight className="size-4 text-muted-foreground" /></button>)}</div> : <p className="text-sm text-muted-foreground">{t('repo.historyEmpty')}</p>}{list.data?.nextCursor ? <Button className="mt-4" variant="outline" onClick={onLoadMore} loading={list.isFetching}>{t('repo.loadMore')}</Button> : null}</CardContent></Card>
  </div></div>;
}
