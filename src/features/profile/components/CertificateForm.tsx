import React, { useState } from 'react';
import { useLanguage } from '@/shared/languages';
import type { Certificate } from '../types/profile.types';

type CertificateFormState = Omit<Certificate, 'id'>;

const emptyCertificate = (): CertificateFormState => ({
  name: '',
  issuer: '',
  issueDate: '',
  expiryDate: '',
  credentialUrl: '',
});

interface CertificateFormProps {
  initial?: Certificate;
  onSubmit: (data: CertificateFormState) => Promise<void>;
  onCancel: () => void;
}

export const CertificateForm: React.FC<CertificateFormProps> = ({ initial, onSubmit, onCancel }) => {
  const { t } = useLanguage();
  const [form, setForm] = useState<CertificateFormState>(initial ? { ...initial } : emptyCertificate());
  const [isSaving, setIsSaving] = useState(false);

  return (
    <form onSubmit={(event) => { event.preventDefault(); setIsSaving(true); void onSubmit(form).finally(() => setIsSaving(false)); }} className="space-y-3">
      {(['name', 'issuer', 'issueDate', 'expiryDate', 'credentialUrl'] as const).map((key) => (
        <label key={key} className="block">
          <span className="text-label text-muted-foreground">{t(`profile.certificates.${key === 'credentialUrl' ? 'url' : key}`)}</span>
          <input className="mt-1 w-full rounded-lg border border-default bg-surface-overlay px-3 py-2 text-sm" value={form[key] ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))} required={key === 'name' || key === 'issuer'} />
        </label>
      ))}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={isSaving}>{isSaving ? t('profile.common.saving') : t('profile.certificates.save')}</button>
        <button type="button" className="btn-secondary" onClick={onCancel}>{t('profile.certificates.cancel')}</button>
      </div>
    </form>
  );
};
