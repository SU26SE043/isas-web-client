import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import type { InviteResolution } from '../types/campaignManagement.types';

interface CandidateSelectionPanelProps {
  onImport: (emails: string[]) => Promise<InviteResolution>;
}

function parseEmails(value: string) {
  return value
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function CandidateSelectionPanel({ onImport }: CandidateSelectionPanelProps) {
  const { t } = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);
  const [emails, setEmails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<InviteResolution | null>(null);

  const importEmails = async (raw: string) => {
    const parsed = parseEmails(raw);
    if (parsed.length === 0) return;
    setIsSubmitting(true);
    setResult(null);
    try {
      const resolution = await onImport(parsed);
      setResult(resolution);
      if (resolution.rejected.length === 0) setEmails('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFile = async (file: File) => {
    const text = await file.text();
    await importEmails(text);
  };

  return (
    <section className="space-y-4 rounded-xl border border-subtle bg-surface-raised p-5">
      <div>
        <h2 className="text-base font-semibold text-foreground">{t('employer.campaigns.selection.title')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('employer.campaigns.selection.description')}</p>
      </div>

      {result ? (
        <div className="space-y-2">
          {result.linked.length > 0 ? (
            <Alert variant="success">
              <AlertDescription>{t('employer.campaigns.invite.linked').replace('{count}', String(result.linked.length))}</AlertDescription>
            </Alert>
          ) : null}
          {result.pending.length > 0 ? (
            <Alert>
              <AlertDescription>{t('employer.campaigns.invite.pending').replace('{count}', String(result.pending.length))}</AlertDescription>
            </Alert>
          ) : null}
          {result.rejected.length > 0 ? (
            <Alert variant="warning">
              <AlertDescription>
                <p className="font-medium">{t('employer.campaigns.invite.rejectedTitle')}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {result.rejected.map((item) => (
                    <li key={item.email}>
                      {item.email}:{' '}
                      {item.reason === 'EMPLOYER_EMAIL' || item.reason === 'INVALID_EMAIL'
                        ? t(`employer.campaigns.invite.rejected.${item.reason}`)
                        : item.reason}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="selection-emails">{t('employer.campaigns.selection.emails')}</Label>
        <textarea
          id="selection-emails"
          rows={5}
          value={emails}
          onChange={(event) => setEmails(event.target.value)}
          className="w-full rounded-lg border border-input bg-surface-overlay px-3 py-2 text-sm text-foreground"
          placeholder={t('employer.campaigns.selection.placeholder')}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button type="button" onClick={() => importEmails(emails)} loading={isSubmitting}>
          {t('employer.campaigns.selection.import')}
        </Button>
        <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
          <Upload className="size-4" aria-hidden /> {t('employer.campaigns.selection.uploadFile')}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.csv"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
            event.target.value = '';
          }}
        />
      </div>
    </section>
  );
}
