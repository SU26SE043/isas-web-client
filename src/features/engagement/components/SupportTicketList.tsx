import { useLanguage } from '@/shared/languages';
import type { SupportTicket } from '../types/engagement.types';

export function SupportTicketList({ tickets }: { tickets: SupportTicket[] }) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';

  if (tickets.length === 0) {
    return (
      <div className="rounded-xl border border-subtle bg-surface-raised p-8 text-center">
        <p className="font-medium text-foreground">{t('engagement.support.emptyTitle')}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t('engagement.support.emptyDescription')}</p>
      </div>
    );
  }

  return (
    <section className="space-y-3">
      {tickets.map((ticket) => (
        <article key={ticket.id} className="rounded-xl border border-subtle bg-surface-raised p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-medium text-foreground">{ticket.subject}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(`engagement.priority.${ticket.priority}`)} · {t(`engagement.support.status.${ticket.status}`)}
              </p>
            </div>
            <span className="text-xs text-muted-foreground">{new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(ticket.createdAt))}</span>
          </div>
        </article>
      ))}
    </section>
  );
}
