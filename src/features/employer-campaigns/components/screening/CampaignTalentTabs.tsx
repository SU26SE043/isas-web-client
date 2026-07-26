import { useSearchParams } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import { CvScreeningPanel } from './CvScreeningPanel';
import { InterviewResultsPanel } from './InterviewResultsPanel';
import { parseScreeningTab, type ScreeningTab } from './screeningUtils';

interface CampaignTalentTabsProps {
  campaignId: string;
  isActive: boolean;
  passScorePct?: number | null;
}

export function CampaignTalentTabs({
  campaignId,
  isActive,
  passScorePct,
}: CampaignTalentTabsProps) {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = parseScreeningTab(searchParams.get('tab'));

  const setTab = (tab: ScreeningTab) => {
    const next = new URLSearchParams(searchParams);
    if (tab === 'screening') {
      next.delete('tab');
    } else {
      next.set('tab', tab);
    }
    setSearchParams(next, { replace: true });
  };

  const tabs: Array<{ id: ScreeningTab; label: string }> = [
    { id: 'screening', label: t('employer.campaigns.screening.tabs.cv') },
    { id: 'interview', label: t('employer.campaigns.screening.tabs.interview') },
  ];

  return (
    <section className="space-y-4 rounded-xl border border-subtle bg-surface-raised p-5">
      {!isActive ? (
        <Alert variant="warning">
          <AlertDescription>{t('employer.campaigns.screening.errors.campaignNotActive')}</AlertDescription>
        </Alert>
      ) : null}

      <div
        role="tablist"
        aria-label={t('employer.campaigns.screening.tabs.cv')}
        className="flex flex-wrap gap-2 rounded-xl border border-subtle bg-surface-overlay p-1"
      >
        {tabs.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setTab(tab.id)}
              className={cn(
                'flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-[background-color,color,border-color,box-shadow] duration-200 ease-out',
                selected
                  ? 'border-foreground bg-foreground text-background shadow-sm'
                  : 'border-transparent text-muted-foreground hover:bg-white/[0.04] hover:text-foreground',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        {activeTab === 'screening' ? (
          <CvScreeningPanel campaignId={campaignId} isActive={isActive} />
        ) : (
          <InterviewResultsPanel
            campaignId={campaignId}
            enabled={true}
            passScorePct={passScorePct}
          />
        )}
      </div>
    </section>
  );
}
