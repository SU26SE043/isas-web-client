import { useState } from 'react';
import { BriefcaseBusiness } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import { campaignManagementService } from '../../services/campaignManagement.service';
import {
  employerCampaignDetailQueryKey,
  EMPLOYER_CAMPAIGNS_QUERY_KEY,
} from '../../hooks/useEmployerCampaigns';
import { buildJobNeedsRescuePayload } from '../../utils/jobNeedsRescue';

interface JobNeedsRescueEditorProps {
  campaignId: string;
}

export function JobNeedsRescueEditor({ campaignId }: JobNeedsRescueEditorProps) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const mutation = useMutation({
    mutationFn: () =>
      campaignManagementService.updateCampaignJobNeeds(
        campaignId,
        buildJobNeedsRescuePayload(text),
      ),
    onSuccess: (campaign) => {
      queryClient.setQueryData(employerCampaignDetailQueryKey(campaignId), campaign);
      void queryClient.invalidateQueries({ queryKey: EMPLOYER_CAMPAIGNS_QUERY_KEY });
    },
  });

  const trimmedText = text.trim();
  const errorStatus = mutation.isError
    ? campaignManagementService.getErrorStatus(mutation.error)
    : undefined;
  const errorKey =
    errorStatus === 409
      ? 'employer.campaigns.screening.rescue.conflict'
      : 'employer.campaigns.screening.rescue.saveFailed';

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
        <Label htmlFor="job-needs-rescue-text">
          {t('employer.campaigns.screening.rescue.label')}
        </Label>
        <Input
          id="job-needs-rescue-text"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            if (mutation.isError) mutation.reset();
          }}
          placeholder={t('employer.campaigns.screening.rescue.placeholder')}
          disabled={mutation.isPending}
          aria-describedby="job-needs-rescue-help"
        />
        <p id="job-needs-rescue-help" className="text-xs text-muted-foreground">
          {t('employer.campaigns.screening.rescue.help')}
        </p>
      </div>

      {mutation.isError ? (
        <Alert variant="error" className="mt-4">
          <AlertDescription>{t(errorKey)}</AlertDescription>
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
          disabled={!trimmedText || mutation.isPending || mutation.isSuccess}
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

