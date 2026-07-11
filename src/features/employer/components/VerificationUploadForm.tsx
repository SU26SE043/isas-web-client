import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import type { VerificationInput, VerificationRecord } from '../types/employer.types';

interface VerificationUploadFormProps {
  verification: VerificationRecord;
  onSubmit: (input: VerificationInput) => Promise<void>;
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs text-error">{message}</p> : null;
}

export function VerificationUploadForm({ verification, onSubmit }: VerificationUploadFormProps) {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const schema = useMemo(
    () =>
      z.object({
        documentType: z.string().min(1, t('employer.company.validation.required')),
        registrationNumber: z.string().min(1, t('employer.company.validation.required')),
        issuingCountry: z.string().min(1, t('employer.company.validation.required')),
        documentName: z.string().min(1, t('employer.verify.validation.file')),
        attested: z.boolean().refine((value) => value, t('employer.verify.validation.attested')),
      }),
    [t],
  );

  const form = useForm<VerificationInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      documentType: verification.documentType || 'business_registration',
      registrationNumber: verification.registrationNumber,
      issuingCountry: verification.issuingCountry || 'Vietnam',
      documentName: verification.documentName,
      attested: false,
    },
  });
  const documentName = form.watch('documentName');

  const submit = form.handleSubmit(async (values) => {
    setSubmitted(false);
    await onSubmit(values);
    setSubmitted(true);
  });

  return (
    <form onSubmit={submit} className="space-y-5">
      {submitted ? (
        <Alert variant="success">
          <AlertDescription>{t('employer.verify.submitted')}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="documentType">{t('employer.verify.documentType')}</Label>
          <select
            id="documentType"
            className="h-8 w-full rounded-lg border border-input bg-surface-overlay px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            {...form.register('documentType')}
          >
            <option value="business_registration">{t('employer.verify.documentType.businessRegistration')}</option>
            <option value="tax_certificate">{t('employer.verify.documentType.taxCertificate')}</option>
            <option value="enterprise_license">{t('employer.verify.documentType.enterpriseLicense')}</option>
          </select>
          <FieldError message={form.formState.errors.documentType?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="registrationNumber">{t('employer.verify.registrationNumber')}</Label>
          <Input id="registrationNumber" {...form.register('registrationNumber')} />
          <FieldError message={form.formState.errors.registrationNumber?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="issuingCountry">{t('employer.verify.issuingCountry')}</Label>
          <Input id="issuingCountry" {...form.register('issuingCountry')} />
          <FieldError message={form.formState.errors.issuingCountry?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="document">{t('employer.verify.document')}</Label>
          <input
            id="document"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="sr-only"
            onChange={(event) => form.setValue('documentName', event.target.files?.[0]?.name ?? '', { shouldValidate: true })}
          />
          <div className="flex flex-col gap-2 rounded-lg border border-input bg-surface-overlay p-2 sm:flex-row sm:items-center">
            <Label htmlFor="document" className="inline-flex h-8 cursor-pointer items-center justify-center rounded-lg bg-white px-3 text-sm font-medium text-black">
              {t('employer.verify.chooseFile')}
            </Label>
            <span className="min-w-0 truncate text-sm text-muted-foreground">
              {documentName || t('employer.verify.noFile')}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{t('employer.verify.documentHint')}</p>
          <FieldError message={form.formState.errors.documentName?.message} />
        </div>
      </div>

      <label className="flex gap-3 rounded-xl border border-subtle bg-surface-overlay p-4 text-sm text-foreground">
        <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-subtle bg-surface-base" {...form.register('attested')} />
        <span>{t('employer.verify.attested')}</span>
      </label>
      <FieldError message={form.formState.errors.attested?.message} />

      <Button type="submit" loading={form.formState.isSubmitting} className="w-full sm:w-auto">
        {form.formState.isSubmitting ? t('employer.verify.submitting') : t('employer.verify.submit')}
      </Button>
    </form>
  );
}
