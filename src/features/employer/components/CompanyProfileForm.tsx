import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import { PUBLIC_EMAIL_DOMAINS } from '../mocks/employer.fixtures';
import type { CompanyProfile, CompanyProfileInput } from '../types/employer.types';

interface CompanyProfileFormProps {
  profile: CompanyProfile;
  onSave: (input: CompanyProfileInput) => Promise<void>;
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs text-error">{message}</p> : null;
}

export function CompanyProfileForm({ profile, onSave }: CompanyProfileFormProps) {
  const { t } = useLanguage();
  const [saved, setSaved] = useState(false);
  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t('employer.company.validation.required')),
        legalName: z.string().min(1, t('employer.company.validation.required')),
        emailDomain: z
          .string()
          .min(1, t('employer.company.validation.required'))
          .refine((value) => !value.includes('@') && !PUBLIC_EMAIL_DOMAINS.includes(value.toLowerCase()), {
            message: t('employer.company.validation.domain'),
          }),
        website: z.string().min(1, t('employer.company.validation.required')).startsWith('https://', {
          message: t('employer.company.validation.website'),
        }),
        industry: z.string().min(1, t('employer.company.validation.required')),
        size: z.string().min(1, t('employer.company.validation.required')),
        country: z.string().min(1, t('employer.company.validation.required')),
        city: z.string().min(1, t('employer.company.validation.required')),
        taxId: z.string().min(1, t('employer.company.validation.required')),
        description: z.string().min(1, t('employer.company.validation.required')),
      }),
    [t],
  );

  const form = useForm<CompanyProfileInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: profile.name,
      legalName: profile.legalName,
      emailDomain: profile.emailDomain,
      website: profile.website,
      industry: profile.industry,
      size: profile.size,
      country: profile.country,
      city: profile.city,
      taxId: profile.taxId,
      description: profile.description,
    },
  });

  const submit = form.handleSubmit(async (values) => {
    setSaved(false);
    await onSave(values);
    setSaved(true);
  });

  const renderInput = (name: keyof CompanyProfileInput, label: string, helper?: string) => (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} aria-invalid={!!form.formState.errors[name]} {...form.register(name)} />
      {helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
      <FieldError message={form.formState.errors[name]?.message} />
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-5">
      {saved ? (
        <Alert variant="success">
          <AlertDescription>{t('employer.company.saved')}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {renderInput('name', t('employer.company.name'))}
        {renderInput('legalName', t('employer.company.legalName'))}
        {renderInput('emailDomain', t('employer.company.emailDomain'), t('employer.company.helper.domain'))}
        {renderInput('website', t('employer.company.website'), t('employer.company.helper.website'))}
        {renderInput('industry', t('employer.company.industry'))}
        {renderInput('size', t('employer.company.size'))}
        {renderInput('country', t('employer.company.country'))}
        {renderInput('city', t('employer.company.city'))}
        {renderInput('taxId', t('employer.company.taxId'))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t('employer.company.description')}</Label>
        <textarea
          id="description"
          rows={5}
          aria-invalid={!!form.formState.errors.description}
          className={cn(
            'w-full rounded-lg border border-input bg-surface-overlay px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
          )}
          {...form.register('description')}
        />
        <FieldError message={form.formState.errors.description?.message} />
      </div>

      <Button type="submit" loading={form.formState.isSubmitting} className="w-full sm:w-auto">
        {form.formState.isSubmitting ? t('employer.company.saving') : t('employer.company.save')}
      </Button>
    </form>
  );
}
