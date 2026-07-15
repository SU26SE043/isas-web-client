import { useNavigate } from 'react-router-dom';
import { ArrowRight, Camera, Clock3, ListChecks } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { CampaignBriefing } from '../types/campaign.types';

interface CampaignBriefingPanelProps {
  briefing: CampaignBriefing;
}

export function CampaignBriefingPanel({ briefing }: CampaignBriefingPanelProps) {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const title = language === 'vi' ? briefing.titleVi : briefing.title;
  const instructions = language === 'vi' ? briefing.instructionsVi : briefing.instructions;
  const proctoringNotice = language === 'vi' ? briefing.proctoringNoticeVi : briefing.proctoringNotice;
  const steps = language === 'vi' ? briefing.assessmentStepsVi : briefing.assessmentSteps;

  return (
    <Card className="mx-auto max-w-3xl border border-subtle bg-surface-raised">
      <CardContent className="space-y-6 p-6 md:p-8">
        <header className="space-y-2">
          <h2 className="text-label text-muted-foreground">{t('campaigns.briefing.eyebrow')}</h2>
          <h1 className="heading-primary text-3xl text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{briefing.company}</p>
        </header>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Clock3 className="size-4" aria-hidden />
            {t('campaigns.briefing.duration').replace('{minutes}', String(briefing.estimatedMinutes))}
          </span>
          <span className="inline-flex items-center gap-2">
            <Camera className="size-4" aria-hidden />
            {t('campaigns.briefing.cameraRequired')}
          </span>
        </div>

        <section className="space-y-3">
          <h2 className="heading-secondary text-lg text-foreground">{t('campaigns.briefing.instructionsTitle')}</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            {instructions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-subtle bg-surface-overlay p-4">
          <h2 className="heading-secondary text-sm text-foreground">{t('campaigns.briefing.proctoringTitle')}</h2>
          <p className="body-text mt-2 text-sm text-muted-foreground">{proctoringNotice}</p>
        </section>

        <section className="space-y-3">
          <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <ListChecks className="size-4" aria-hidden />
            {t('campaigns.briefing.stepsTitle')}
          </h2>
          <ol className="grid gap-2 sm:grid-cols-2">
            {steps.map((step, index) => (
              <li key={step} className="rounded-lg border border-subtle bg-surface-base px-3 py-2 text-sm text-foreground">
                <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </section>

        <button
          type="button"
          className={cn(buttonVariants(), 'w-full sm:w-auto')}
          onClick={() => navigate(`/interview/${briefing.sessionId}/prepare`)}
        >
          {t('campaigns.briefing.startAssessment')}
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </CardContent>
    </Card>
  );
}
