import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';

interface EmailInviteInputsProps {
  disabled: boolean;
  onAddSingle: (email: string) => { ok: boolean; errorKey?: string };
  onAddBulk: (raw: string) => {
    validEmails: string[];
    validCount: number;
    invalidCount: number;
    duplicateCount: number;
  };
  onRemoveEmail: (email: string) => void;
}

export function EmailInviteInputs({
  disabled,
  onAddSingle,
  onAddBulk,
  onRemoveEmail,
}: EmailInviteInputsProps) {
  const { t } = useLanguage();
  const [inputValue, setInputValue] = useState('');
  const [bulkValue, setBulkValue] = useState('');
  const [singleError, setSingleError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    validEmails: string[];
    validCount: number;
    invalidCount: number;
    duplicateCount: number;
  } | null>(null);

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

      <div className="space-y-2 border-t border-satin pt-5">
        <Label>{t('employer.campaigns.emailInvitations.fileInput.label')}</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.csv,text/plain,text/csv"
          className="sr-only"
          disabled={disabled}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            void file.text().then((text) => {
              const summary = onAddBulk(text);
              setUploadedFile({ name: file.name, ...summary });
            });
            event.target.value = '';
          }}
        />
        {uploadedFile ? (
          <div className="flex items-start gap-3 rounded-xl border border-satin bg-surface-raised p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{uploadedFile.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('employer.campaigns.emailInvitations.fileInput.summary')
                  .replace('{valid}', String(uploadedFile.validCount))
                  .replace('{invalid}', String(uploadedFile.invalidCount))
                  .replace('{duplicate}', String(uploadedFile.duplicateCount))}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={disabled}
              aria-label={t('employer.campaigns.emailInvitations.fileInput.remove')}
              onClick={() => {
                uploadedFile.validEmails.forEach(onRemoveEmail);
                setUploadedFile(null);
              }}
            >
              <X aria-hidden />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload aria-hidden />
            {t('employer.campaigns.emailInvitations.fileInput.choose')}
          </Button>
        )}
      </div>
    </div>
  );
}
