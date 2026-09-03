import { useState } from 'react';
import { Plus, Target, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/shared/languages';
import { campaignManagementService } from '../services/campaignManagement.service';
import type { CampaignJobNeed, JobNeedCategory } from '../types/campaign.api.types';

export function CampaignJobNeedsCard({ campaignId, initialNeeds, editable }: { campaignId: string; initialNeeds: CampaignJobNeed[]; editable: boolean }) {
  const { t } = useLanguage();
  const [needs, setNeeds] = useState(initialNeeds);
  const [text, setText] = useState('');
  const [mustHave, setMustHave] = useState(true);
  const [category, setCategory] = useState<JobNeedCategory>('Technical');
  const [locked, setLocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const save = async (next: CampaignJobNeed[]) => { setSaving(true); setError(null); try { const updated = await campaignManagementService.updateCampaignJobNeeds(campaignId, next.map((item) => ({ needId: item.needId, category: (item.category || 'Technical') as JobNeedCategory, text: item.text, isMustHave: item.isMustHave }))); setNeeds(updated.jobNeeds); } catch (error) { if (campaignManagementService.getErrorStatus(error) === 409) setLocked(true); else setError(t('employer.campaigns.jobNeeds.saveError')); } finally { setSaving(false); } };
  const add = () => { const value = text.trim(); if (!value) return; const next = [...needs, { needId: `client-${crypto.randomUUID()}`, category, text: value, isMustHave: mustHave }]; setText(''); void save(next); };
  const remove = (id: string) => { const next = needs.filter((item) => item.needId !== id); setNeeds(next); void save(next); };
  const grouped = ['Technical', 'WorkStyle', 'Communication', 'Growth'].map((group) => ({ group, items: needs.filter((need) => need.category === group) }));
  return <section className="rounded-xl border border-satin bg-surface-overlay p-4">
    <div className="mb-3 flex items-center gap-2"><Target className="size-4 text-info" aria-hidden /><h3 className="font-semibold text-foreground">{t('employer.campaigns.jobNeeds.title')}</h3></div>
    {error ? <Alert variant="error" className="mb-3"><AlertDescription>{error}</AlertDescription></Alert> : null}
    {locked ? <Alert variant="info" className="mb-3"><AlertDescription>{t('employer.campaigns.jobNeeds.locked').replace('{{count}}', String(needs.length))}</AlertDescription></Alert> : null}
    <div className="grid gap-3 sm:grid-cols-2">{grouped.map(({ group, items }) => <div key={group} className="rounded-lg border border-satin p-2"><p className="mb-2 text-xs font-semibold text-muted-foreground">{t(`employer.campaigns.jobNeeds.group.${group}`)}</p>{items.length ? items.map((need) => <div key={need.needId} className="flex items-center gap-2 border-t border-satin py-2"><span className="min-w-0 flex-1 text-sm text-foreground">{need.text}</span>{need.isMustHave ? <span className="rounded-md border border-warning/40 px-2 py-0.5 text-xs text-warning">{t('employer.campaigns.jobNeeds.mustHave')}</span> : null}{editable && !locked ? <Button type="button" variant="ghost" size="icon-sm" disabled={saving} onClick={() => remove(need.needId)} aria-label={t('employer.campaigns.jobNeeds.remove')}><Trash2 className="size-4" aria-hidden /></Button> : null}</div>) : <p className="text-xs text-muted-foreground">—</p>}</div>)}</div>
    {editable && !locked ? <div className="mt-3 flex flex-wrap items-center gap-2"><Input value={text} disabled={saving} onChange={(event) => setText(event.target.value)} placeholder={t('employer.campaigns.jobNeeds.placeholder')} className="min-w-[14rem] flex-1" /><select value={category} disabled={saving} onChange={(event) => setCategory(event.target.value as JobNeedCategory)} className="h-9 rounded-md border border-satin bg-surface-base px-2 text-sm">{['Technical', 'WorkStyle', 'Communication', 'Growth'].map((item) => <option key={item} value={item}>{t(`employer.campaigns.jobNeeds.group.${item}`)}</option>)}</select><label className="flex items-center gap-1 text-xs text-muted-foreground"><input type="checkbox" checked={mustHave} disabled={saving} onChange={(event) => setMustHave(event.target.checked)} />{t('employer.campaigns.jobNeeds.mustHave')}</label><Button type="button" size="sm" disabled={saving || !text.trim()} onClick={add}><Plus className="size-4" aria-hidden />{t('employer.campaigns.jobNeeds.add')}</Button></div> : null}
  </section>;
}
