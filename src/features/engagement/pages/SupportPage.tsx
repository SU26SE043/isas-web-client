import { useLanguage } from '@/shared/languages';
import { EngagementPageShell } from '../components/EngagementPageShell';
import { SupportTicketForm } from '../components/SupportTicketForm';
import { SupportTicketList } from '../components/SupportTicketList';
import { useEngagement } from '../hooks/useEngagement';
import type { EngagementScope } from '../types/engagement.types';

export function SupportPage({ scope }: { scope: EngagementScope }) {
  const { t } = useLanguage();
  const { tickets, createTicket } = useEngagement(scope);

  return (
    <EngagementPageShell eyebrow="SCR-CAN-051" title={t('engagement.support.title')} description={t('engagement.support.descriptionPage')}>
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <SupportTicketForm onCreate={createTicket} />
        <SupportTicketList tickets={tickets} />
      </section>
    </EngagementPageShell>
  );
}
