import type { CandidateUploadResponse } from '../../types/campaign.api.types';
import { useLanguage } from '@/shared/languages';

interface CandidateUploadSummaryProps {
  summary: CandidateUploadResponse;
}

export function CandidateUploadSummary({ summary }: CandidateUploadSummaryProps) {
  const { t } = useLanguage();
  const rejectedItems = summary.candidates.filter(
    (item) => item.status.toLowerCase() === 'rejected',
  );

  const cards = [
    { label: t('employer.campaigns.screening.summary.received'), value: summary.received },
    { label: t('employer.campaigns.screening.summary.filtered'), value: summary.filtered },
    { label: t('employer.campaigns.screening.summary.rejected'), value: summary.rejected },
    { label: t('employer.campaigns.screening.summary.skipped'), value: summary.skipped },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-satin bg-surface-overlay px-3 py-2"
          >
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{card.value}</p>
          </div>
        ))}
      </div>

      {rejectedItems.length > 0 ? (
        <div className="rounded-lg border border-satin bg-surface-overlay px-3 py-3">
          <p className="text-sm font-medium text-foreground">
            {t('employer.campaigns.screening.summary.rejected')}
          </p>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            {rejectedItems.map((item) => (
              <li key={item.id} className="border-b border-satin pb-2 last:border-0 last:pb-0">
                <span className="text-foreground">{item.fullName ?? item.email ?? item.id}</span>
                {item.rejectReason ? (
                  <span className="mt-0.5 block text-xs">{item.rejectReason}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
