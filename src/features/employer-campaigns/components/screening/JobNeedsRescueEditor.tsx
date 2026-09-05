import { useState } from 'react';
import { BriefcaseBusiness } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/shared/languages';
import { campaignManagementService } from '../../services/campaignManagement.service';
import {
  employerCampaignDetailQueryKey,
  EMPLOYER_CAMPAIGNS_QUERY_KEY,
} from '../../hooks/useEmployerCampaigns';
import type { JobNeedCategory, UpdateCampaignJobNeedsRequest } from '../../types/campaign.api.types';

interface JobNeedsRescueEditorProps {
  campaignId: string;
}

export function JobNeedsRescueEditor({ campaignId }: JobNeedsRescueEditorProps) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [category, setCategory] = useState<JobNeedCategory>('Technical');
  const [mustHave, setMustHave] = useState(false);
  const [needs, setNeeds] = useState<UpdateCampaignJobNeedsRequest[]>([]);
  const [locked, setLocked] = useState(false);
  const mutation = useMutation({
    mutationFn: () => campaignManagementService.updateCampaignJobNeeds(campaignId, needs),
    onError: (error) => {
      if (campaignManagementService.getErrorStatus(error) === 409) setLocked(true);
    },
    onSuccess: (campaign) => {
      queryClient.setQueryData(employerCampaignDetailQueryKey(campaignId), campaign);
      void queryClient.invalidateQueries({ queryKey: EMPLOYER_CAMPAIGNS_QUERY_KEY });
    },
  });

  const trimmedText = text.trim();
  const addNeed = () => {
    if (!trimmedText || locked) return;
    setNeeds((current) => [...current, { category, text: trimmedText, isMustHave: mustHave }]);
    setText('');
    mutation.reset();
  };
  const errorStatus = mutation.isError
    ? campaignManagementService.getErrorStatus(mutation.error)
    : undefined;
  const errorKey = errorStatus === 409 ? 'employer.campaigns.screening.rescue.conflict' : 'employer.campaigns.screening.rescue.saveFailed';

  return (
    <section className="rounded-xl border border-warning/30 bg-surface-elevated p-4 shadow-[var(--satin-inset)] sm:p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg border border-satin bg-surface-overlay p-2 text-foreground">
          <BriefcaseBusiness aria-hidden className="size-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="font-semibold text-foreground">
            {t('employer.campaigns.screening.rescue.title')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('employer.campaigns.screening.rescue.description')}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <label htmlFor="job-needs-rescue-text" className="text-sm font-medium text-foreground">{t('employer.campaigns.screening.rescue.label')}</label>
        <Input
          id="job-needs-rescue-text"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            if (mutation.isError) mutation.reset();
          }}
          placeholder={t('employer.campaigns.screening.rescue.placeholder')}
          disabled={mutation.isPending || locked}
          aria-describedby="job-needs-rescue-help"
        />
        <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <select value={category} disabled={mutation.isPending || locked} onChange={(event) => setCategory(event.target.value as JobNeedCategory)} className="h-10 rounded-md border border-satin bg-surface-base px-2 text-sm text-foreground">
            {(['Technical', 'WorkStyle', 'Communication', 'Growth'] as JobNeedCategory[]).map((item) => <option key={item} value={item}>{t(`employer.campaigns.jobNeeds.group.${item}`)}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={mustHave} disabled={mutation.isPending || locked} onChange={(event) => setMustHave(event.target.checked)} />{t('employer.campaigns.jobNeeds.mustHave')}</label>
          <Button type="button" variant="outline" disabled={!trimmedText || mutation.isPending || locked} onClick={addNeed}>{t('employer.campaigns.screening.rescue.add')}</Button>
        </div>
        <p id="job-needs-rescue-help" className="text-xs text-muted-foreground">
          {t('employer.campaigns.screening.rescue.help')}
        </p>
      </div>

      {needs.length ? <ul className="mt-3 space-y-1 text-sm text-foreground">{needs.map((need, index) => <li key={`${need.text}-${index}`} className="flex items-center gap-2"><span className="min-w-0 flex-1">{need.text}</span><span className="text-xs text-muted-foreground">{t(`employer.campaigns.jobNeeds.group.${need.category}`)}{need.isMustHave ? ` · ${t('employer.campaigns.jobNeeds.mustHave')}` : ''}</span></li>)}</ul> : null}
      {mutation.isError ? (
        <Alert variant="error" className="mt-4">
          <AlertDescription>{errorStatus === 409 ? t(errorKey).replace('{{count}}', String(needs.length)) : t(errorKey)}</AlertDescription>
        </Alert>
      ) : null}
      {mutation.isSuccess ? (
        <Alert variant="success" className="mt-4">
          <AlertDescription>{t('employer.campaigns.screening.rescue.success')}</AlertDescription>
        </Alert>
      ) : null}

      <div className="mt-4 flex justify-end">
        <Button
          type="button"
          className="bg-foreground text-background hover:bg-foreground/85"
          disabled={!needs.length || mutation.isPending || locked}
          loading={mutation.isPending}
          onClick={() => void mutation.mutate()}
        >
          {mutation.isPending
            ? t('employer.campaigns.screening.rescue.saving')
            : t('employer.campaigns.screening.rescue.save')}
        </Button>
      </div>
    </section>
  );
}

