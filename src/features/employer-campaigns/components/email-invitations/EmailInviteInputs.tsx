import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';

interface EmailInviteInputsProps {
  disabled: boolean;
  onAddSingle: (email: string) => { ok: boolean; errorKey?: string };
  onAddBulk: (raw: string) => void;
}

export function EmailInviteInputs({ disabled, onAddSingle, onAddBulk }: EmailInviteInputsProps) {
  const { t } = useLanguage();
  const [inputValue, setInputValue] = useState('');
  const [bulkValue, setBulkValue] = useState('');
  const [singleError, setSingleError] = useState<string | null>(null);

  const addSingle = () => {
    const result = onAddSingle(inputValue);
    if (!result.ok) {
      setSingleError(
        result.errorKey ? t(result.errorKey) : t('employer.campaigns.emailInvitations.errors.invalidEmail'),
      );
      return;
    }
    setSingleError(null);
    setInputValue('');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email-invite-single">
          {t('employer.campaigns.emailInvitations.input.label')}
        </Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="email-invite-single"
            type="email"
            autoComplete="email"
            disabled={disabled}
            placeholder={t('employer.campaigns.emailInvitations.input.placeholder')}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setSingleError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSingle();
              }
            }}
          />
          <Button type="button" variant="outline" disabled={disabled} onClick={addSingle}>
            {t('employer.campaigns.emailInvitations.input.add')}
          </Button>
        </div>
        {singleError ? (
          <p className="text-xs text-error" role="alert">
            {singleError}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email-invite-bulk">
          {t('employer.campaigns.emailInvitations.bulkInput.label')}
        </Label>
        <textarea
          id="email-invite-bulk"
          rows={6}
          disabled={disabled}
          className="w-full rounded-lg border border-satin bg-surface-raised px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          placeholder={t('employer.campaigns.emailInvitations.bulkInput.placeholder')}
          value={bulkValue}
          onChange={(e) => setBulkValue(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          {t('employer.campaigns.emailInvitations.bulkInput.hint')}
        </p>
        <Button
          type="button"
          variant="outline"
          disabled={disabled || !bulkValue.trim()}
          onClick={() => {
            onAddBulk(bulkValue);
            // Invalid tokens are surfaced in the email list; keep only unrecognized bulk text empty.
            setBulkValue('');
          }}
        >
          {t('employer.campaigns.emailInvitations.bulkInput.add')}
        </Button>
      </div>
    </div>
  );
}
