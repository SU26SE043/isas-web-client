import React from 'react';
import { useLanguage } from '@/shared/languages';
import type { Certificate } from '../types/profile.types';

interface CertificateCardProps {
  certificate: Certificate;
  onEdit: () => void;
  onDelete: () => void;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  onEdit,
  onDelete,
}) => {
  const { t } = useLanguage();

  return (
    <article className="rounded-xl border border-subtle bg-surface-raised p-4">
      <h3 className="font-semibold text-foreground">{certificate.name}</h3>
      <p className="text-sm text-muted-foreground">
        {certificate.issuer} · {certificate.issueDate}
      </p>
      {certificate.credentialUrl ? (
        <a
          href={certificate.credentialUrl}
          className="mt-2 inline-block text-sm text-foreground underline"
          target="_blank"
          rel="noreferrer"
        >
          {certificate.credentialUrl}
        </a>
      ) : null}
      <div className="mt-3 flex gap-2">
        <button type="button" className="btn-secondary" onClick={onEdit}>
          {t('profile.certificates.edit')}
        </button>
        <button type="button" className="btn-ghost text-error" onClick={onDelete}>
          {t('profile.certificates.delete')}
        </button>
      </div>
    </article>
  );
};
