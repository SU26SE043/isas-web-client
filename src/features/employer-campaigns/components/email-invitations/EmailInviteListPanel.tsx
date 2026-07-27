import { Mail, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import type { InvalidEmailItem } from '../../utils/emailInvitationUtils';

interface EmailInviteListPanelProps {
  validEmails: string[];
  invalidEmails: InvalidEmailItem[];
  duplicateEmails: string[];
  disabled: boolean;
  canSend: boolean;
  isSending: boolean;
  capacityWarning: string | null;
  onRemove: (email: string) => void;
  onClearAll: () => void;
  onClearInvalid: () => void;
  onSend: () => void;
}

export function EmailInviteListPanel({
  validEmails,
  invalidEmails,
  duplicateEmails,
  disabled,
  canSend,
  isSending,
  capacityWarning,
  onRemove,
  onClearAll,
  onClearInvalid,
  onSend,
}: EmailInviteListPanelProps) {
  const { t } = useLanguage();
  const total =
    validEmails.length + invalidEmails.length + duplicateEmails.length;

  return (
    <aside className="flex h-full flex-col gap-4 rounded-lg border border-satin bg-surface-overlay p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            {t('employer.campaigns.emailInvitations.list.title')}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('employer.campaigns.emailInvitations.list.total')}: {total} ·{' '}
            {t('employer.campaigns.emailInvitations.list.valid')}: {validEmails.length} ·{' '}
            {t('employer.campaigns.emailInvitations.list.invalid')}: {invalidEmails.length} ·{' '}
            {t('employer.campaigns.emailInvitations.list.duplicate')}: {duplicateEmails.length}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {invalidEmails.length > 0 ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled || isSending}
              onClick={onClearInvalid}
            >
              {t('employer.campaigns.emailInvitations.list.clearInvalid')}
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={disabled || isSending || total === 0}
            onClick={onClearAll}
          >
            {t('employer.campaigns.emailInvitations.list.clearAll')}
          </Button>
        </div>
      </div>

      {total === 0 ? (
        <p className="rounded-md border border-dashed border-satin px-3 py-8 text-center text-sm text-muted-foreground">
          {t('employer.campaigns.emailInvitations.list.empty')}
        </p>
      ) : (
        <ul className="max-h-[28rem] space-y-2 overflow-y-auto">
          {validEmails.map((email) => (
            <EmailRow
              key={email}
              email={email}
              badge={t('employer.campaigns.emailInvitations.list.valid')}
              badgeClass="border-success/30 bg-success-bg text-success"
              disabled={disabled || isSending}
              onRemove={() => onRemove(email)}
            />
          ))}
          {invalidEmails.map((item) => (
            <EmailRow
              key={`invalid-${item.value}-${item.reason}`}
              email={item.value}
              badge={t('employer.campaigns.emailInvitations.list.invalid')}
              badgeClass="border-error/30 bg-error-bg text-error"
              hint={
                item.reason === 'Empty'
                  ? t('employer.campaigns.emailInvitations.errors.emptyEmail')
                  : t('employer.campaigns.emailInvitations.errors.invalidEmail')
              }
              disabled={disabled || isSending}
              onRemove={() => onRemove(item.value)}
            />
          ))}
          {duplicateEmails.map((email) => (
            <EmailRow
              key={`dup-${email}`}
              email={email}
              badge={t('employer.campaigns.emailInvitations.list.duplicate')}
              badgeClass="border-warning/30 bg-warning-bg text-warning"
              hint={t('employer.campaigns.emailInvitations.errors.duplicateEmail')}
              disabled={disabled || isSending}
              onRemove={() => onRemove(email)}
            />
          ))}
        </ul>
      )}

      {capacityWarning ? (
        <p className="rounded-md border border-warning/40 bg-warning-bg px-3 py-2 text-xs text-warning">
          {capacityWarning}
        </p>
      ) : null}

      <div className="mt-auto space-y-2 border-t border-satin pt-4">
        <p className="text-xs text-muted-foreground">
          {t('employer.campaigns.emailInvitations.preview.ready')}
        </p>
        <Button
          type="button"
          className="w-full bg-foreground text-background hover:bg-foreground/85"
          disabled={!canSend || disabled || isSending}
          loading={isSending}
          onClick={onSend}
        >
          {isSending
            ? t('employer.campaigns.emailInvitations.actions.sending')
            : t('employer.campaigns.emailInvitations.actions.send')}
        </Button>
        {invalidEmails.length > 0 ? (
          <p className="text-xs text-error">
            {t('employer.campaigns.emailInvitations.errors.fixInvalidCount').replace(
              '{count}',
              String(invalidEmails.length),
            )}
          </p>
        ) : null}
      </div>
    </aside>
  );
}

function EmailRow({
  email,
  badge,
  badgeClass,
  hint,
  disabled,
  onRemove,
}: {
  email: string;
  badge: string;
  badgeClass: string;
  hint?: string;
  disabled: boolean;
  onRemove: () => void;
}) {
  const { t } = useLanguage();
  return (
    <li className="flex items-start gap-2 rounded-md border border-satin bg-surface-raised px-3 py-2">
      <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="break-words text-sm text-foreground" style={{ overflowWrap: 'anywhere' }}>
          {email}
        </p>
        {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <Badge variant="outline" className={`shrink-0 ${badgeClass}`}>
        {badge}
      </Badge>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        disabled={disabled}
        aria-label={t('employer.campaigns.emailInvitations.list.remove')}
        onClick={onRemove}
      >
        <X className="size-4" aria-hidden />
        <span className="sr-only">{t('employer.campaigns.emailInvitations.list.remove')}</span>
      </Button>
    </li>
  );
}
