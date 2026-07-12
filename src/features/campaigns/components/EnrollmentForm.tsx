import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/shared/languages';
import { campaignService } from '../services/campaign.service';
import type { Campaign, EnrollmentInput, EnrollmentResult } from '../types/campaign.types';

const enrollmentSchema = z.object({
  motivation: z.string().min(20),
  availability: z.string().min(5),
  consent: z.boolean().refine((value) => value),
});

interface EnrollmentFormProps {
  campaign: Campaign;
  onSuccess: (result: EnrollmentResult) => void;
}

export function EnrollmentForm({ campaign, onSuccess }: EnrollmentFormProps) {
  const { t } = useLanguage();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EnrollmentInput>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      motivation: '',
      availability: '',
      consent: false,
    },
  });

  const onSubmit = async (values: EnrollmentInput) => {
    setSubmitError(null);
    try {
      const result = await campaignService.enrollCampaign(campaign.id, values);
      onSuccess(result);
    } catch {
      setSubmitError(t('campaigns.enroll.errorUnavailable'));
    }
  };

  return (
    <Card className="border border-subtle bg-surface-raised">
      <CardHeader>
        <CardTitle className="text-xl text-foreground">{t('campaigns.enroll.formTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <label htmlFor="motivation" className="text-sm font-medium text-foreground">
              {t('campaigns.enroll.motivation')}
            </label>
            <textarea
              id="motivation"
              rows={5}
              {...register('motivation')}
              aria-invalid={Boolean(errors.motivation)}
              className="min-h-32 rounded-lg border border-input bg-surface-overlay px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              placeholder={t('campaigns.enroll.motivationPlaceholder')}
            />
            {errors.motivation ? (
              <p className="text-sm text-destructive" role="alert">{t('campaigns.enroll.motivationError')}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <label htmlFor="availability" className="text-sm font-medium text-foreground">
              {t('campaigns.enroll.availability')}
            </label>
            <input
              id="availability"
              {...register('availability')}
              aria-invalid={Boolean(errors.availability)}
              className="h-10 rounded-lg border border-input bg-surface-overlay px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              placeholder={t('campaigns.enroll.availabilityPlaceholder')}
            />
            {errors.availability ? (
              <p className="text-sm text-destructive" role="alert">{t('campaigns.enroll.availabilityError')}</p>
            ) : null}
          </div>
          <label className="flex gap-3 rounded-xl border border-subtle bg-surface-overlay p-4 text-sm text-muted-foreground">
            <input type="checkbox" {...register('consent')} className="mt-1 size-4 accent-white" />
            <span>
              <span className="mb-1 flex items-center gap-2 font-medium text-foreground">
                <ShieldCheck className="size-4" aria-hidden />
                {t('campaigns.enroll.consentTitle')}
              </span>
              {t('campaigns.enroll.consent')}
              {errors.consent ? (
                <span className="mt-2 block text-destructive" role="alert">{t('campaigns.enroll.consentError')}</span>
              ) : null}
            </span>
          </label>
          {submitError ? <p className="text-sm text-destructive" role="alert">{submitError}</p> : null}
          <Button type="submit" loading={isSubmitting} className="w-full">
            <CheckCircle2 className="size-4" aria-hidden />
            {t('campaigns.enroll.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
