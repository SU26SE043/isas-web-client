import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import { getApiErrorMessage, getApiStatusCode } from '@/shared/api/apiError';
import { AdminPageShell } from '../components/AdminPageShell';
import { RubricLevelsTable } from '../components/rubrics/RubricLevelsTable';
import { useAdminRubrics } from '../hooks/useAdminRubrics';
import type { RubricSet } from '../types/adminApi.types';

const categories = ['Frontend', 'Backend', 'Business Analyst'];
const emptyRubric = (category: string, language: 'vi' | 'en'): RubricSet => ({ category, language, version: 0, criteria: [] });

export function AdminRubricsPage() {
  const { t } = useLanguage();
  const [category, setCategory] = useState(categories[0]);
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [draft, setDraft] = useState<RubricSet | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [seniority, setSeniority] = useState('');
  const [answer, setAnswer] = useState('');
  const query = useAdminRubrics(category, language);
  useEffect(() => { setDraft(query.detail.data ?? null); }, [query.detail.data]);
  const rubric = draft ?? query.detail.data ?? emptyRubric(category, language);
  const forbidden = getApiStatusCode(query.detail.error) === 403;
  const preview = () => { const criterion = rubric.criteria[0]; if (criterion && answer.trim()) query.preview.mutate({ criterionKey: criterion.key, answer }); };
  return <AdminPageShell title={t('admin.rubrics.title')} description={t('admin.rubrics.description')} actions={<><Button type="button" variant="outline" loading={query.suggest.isPending} onClick={() => query.suggest.mutate(seniority || undefined, { onSuccess: (value) => setDraft(value) })}>{t('admin.rubrics.suggest')}</Button><Button type="button" loading={query.update.isPending} disabled={!rubric.criteria.length} onClick={() => setConfirmOpen(true)}>{t('admin.rubrics.save')}</Button></>}>
    <div className="grid gap-4 rounded-xl border border-satin bg-surface-raised p-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="rubric-category">{t('admin.rubrics.category')}</Label><select id="rubric-category" value={category} onChange={(event) => { setCategory(event.target.value); setDraft(null); }} className="h-9 w-full rounded-xl border border-satin bg-surface-overlay px-3 text-sm text-foreground"><option value="Frontend">Frontend</option><option value="Backend">Backend</option><option value="Business Analyst">Business Analyst</option></select></div><div className="space-y-2"><Label htmlFor="rubric-language">{t('admin.rubrics.language')}</Label><select id="rubric-language" value={language} onChange={(event) => { setLanguage(event.target.value as 'vi' | 'en'); setDraft(null); }} className="h-9 w-full rounded-xl border border-satin bg-surface-overlay px-3 text-sm text-foreground"><option value="vi">Tiếng Việt</option><option value="en">English</option></select></div><div className="space-y-2"><Label htmlFor="rubric-seniority">{t('admin.rubrics.seniority')}</Label><Input id="rubric-seniority" value={seniority} onChange={(event) => setSeniority(event.target.value)} placeholder={t('admin.rubrics.seniorityPlaceholder')} /></div><p className="self-end text-sm text-muted-foreground">{t('admin.rubrics.suggestHint')}</p></div>
    {query.detail.isLoading ? <p aria-live="polite" className="rounded-xl border border-satin bg-surface-raised p-6 text-sm text-muted-foreground">{t('admin.rubrics.loading')}</p> : null}
    {query.detail.isError ? <div className="space-y-3"><Alert variant="error"><AlertDescription>{forbidden ? t('admin.rubrics.forbidden') : getApiErrorMessage(query.detail.error, t('admin.rubrics.error'))}</AlertDescription></Alert>{!forbidden ? <Button type="button" variant="outline" onClick={() => void query.detail.refetch()}>{t('admin.rubrics.retry')}</Button> : null}</div> : null}
    {query.suggest.isError ? <Alert variant="error"><AlertDescription>{t('admin.rubrics.suggestError')} {getApiErrorMessage(query.suggest.error)}</AlertDescription></Alert> : null}
    {rubric.criteria.length ? <><Alert variant="info"><AlertDescription>{t('admin.rubrics.suggestHint')}</AlertDescription></Alert><RubricLevelsTable rubric={rubric} onChange={setDraft} /><div className="grid gap-3 rounded-xl border border-satin bg-surface-raised p-4 sm:grid-cols-[1fr_auto]"><Input aria-label={t('admin.rubrics.previewAnswer')} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder={t('admin.rubrics.previewPlaceholder')} /><Button type="button" variant="outline" onClick={preview} loading={query.preview.isPending}>{t('admin.rubrics.preview')}</Button></div>{query.preview.isError ? <Alert variant="error"><AlertDescription>{t(`admin.rubrics.previewError.${getApiStatusCode(query.preview.error) ?? 'default'}`)}</AlertDescription></Alert> : null}</> : null}
    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}><DialogContent><DialogHeader><DialogTitle>{t('admin.rubrics.saveTitle')}</DialogTitle><DialogDescription>{t('admin.rubrics.saveDescription')}</DialogDescription></DialogHeader><DialogFooter><Button type="button" variant="outline" onClick={() => setConfirmOpen(false)}>{t('admin.rubrics.cancel')}</Button><Button type="button" onClick={() => query.update.mutate(rubric, { onSuccess: () => setConfirmOpen(false) })}>{t('admin.rubrics.saveConfirm')}</Button></DialogFooter></DialogContent></Dialog>
  </AdminPageShell>;
}
