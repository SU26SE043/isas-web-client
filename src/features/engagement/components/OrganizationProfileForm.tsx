import { Building2, RefreshCw, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import type { Organization, OrganizationUpdateInput } from '../types/engagement.types';

interface OrganizationProfileFormProps {
  organization: Organization | null;
  canEdit: boolean;
  isLoading: boolean;
  isSaving: boolean;
  errorKey: string | null;
  onSave: (input: OrganizationUpdateInput) => Promise<void>;
  onRetry: () => Promise<void>;
}

export function OrganizationProfileForm({
  organization,
  canEdit,
  isLoading,
  isSaving,
  errorKey,
  onSave,
  onRetry,
}: OrganizationProfileFormProps) {
  const { language, t } = useLanguage();
  const [name, setName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(organization?.name ?? '');
    setTaxCode(organization?.taxCode ?? '');
  }, [organization]);

  const changed = organization
    ? name.trim() !== organization.name || taxCode.trim() !== (organization.taxCode ?? '')
    : false;
  const createdDate = useMemo(() => {
    if (!organization) return '';
    const parsed = new Date(organization.createdAt);
    return Number.isNaN(parsed.getTime())
      ? organization.createdAt
      : new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US').format(parsed);
  }, [language, organization]);

  if (isLoading) {
    return <div aria-label={t('engagement.organization.loading')} className="h-72 animate-pulse rounded-xl border border-satin bg-surface-raised" />;
  }

  if (!organization) {
    return (
      <section className="rounded-xl border border-satin bg-surface-raised p-5">
        <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {t(errorKey ?? 'engagement.organization.error.load')}
        </div>
        <Button className="mt-4" type="button" variant="outline" onClick={() => void onRetry()}>
          <RefreshCw aria-hidden />
          {t('engagement.organization.retry')}
        </Button>
      </section>
    );
  }

  const submit = async () => {
    const input: OrganizationUpdateInput = {};
    if (name.trim() !== organization.name) input.name = name.trim();
    if (taxCode.trim() !== (organization.taxCode ?? '')) input.taxCode = taxCode.trim();
    try {
      await onSave(input);
      setSaved(true);
    } catch {
      // The hook exposes the localized API error and keeps this draft intact.
    }
  };

  return (
    <section className="space-y-5 rounded-xl border border-satin bg-surface-raised p-5">
      <header className="flex items-start gap-3">
        <span className="rounded-lg border border-satin bg-surface-overlay p-2 text-foreground">
          <Building2 aria-hidden />
        </span>
        <div>
          <h2 className="font-semibold text-foreground">{t('engagement.organization.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('engagement.organization.description')}</p>
        </div>
      </header>

      {saved ? <p role="status" className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">{t('engagement.organization.saved')}</p> : null}
      {errorKey ? <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{t(errorKey)}</p> : null}
      {!canEdit ? <p className="rounded-lg border border-satin bg-surface-overlay p-3 text-sm text-muted-foreground">{t('engagement.organization.readOnly')}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="organizationName">{t('engagement.organization.name')}</Label>
          <Input id="organizationName" value={name} onChange={(event) => { setName(event.target.value); setSaved(false); }} disabled={!canEdit || isSaving} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="organizationTaxCode">{t('engagement.organization.taxCode')}</Label>
          <Input id="organizationTaxCode" value={taxCode} onChange={(event) => { setTaxCode(event.target.value); setSaved(false); }} disabled={!canEdit || isSaving} />
        </div>
      </div>

      <dl className="grid gap-3 rounded-lg border border-satin bg-surface-overlay p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">{t('engagement.organization.memberCount')}</dt>
          <dd className="mt-1 font-medium text-foreground">{organization.memberCount}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t('engagement.organization.createdAt')}</dt>
          <dd className="mt-1 font-medium text-foreground">
            <time dateTime={organization.createdAt}>{createdDate}</time>
          </dd>
        </div>
      </dl>

      {canEdit ? (
        <Button type="button" loading={isSaving} disabled={!changed || !name.trim()} onClick={() => void submit()}>
          <Save aria-hidden />
          {t('engagement.organization.save')}
        </Button>
      ) : null}
    </section>
  );
}
