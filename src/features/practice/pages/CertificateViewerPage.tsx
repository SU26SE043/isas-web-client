import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Download, Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { learningService } from '../services/learning.service';
import { buildCertificatePdfBlob } from '../utils/certificatePdf';
import type { CertificateRecord } from '../types/learning.types';

export const CertificateViewerPage: React.FC = () => {
  const { id = '' } = useParams();
  const { t, language } = useLanguage();
  const [certificate, setCertificate] = useState<CertificateRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void learningService
      .getCertificate(id)
      .then((data) => {
        if (active) setCertificate(data);
      })
      .catch(() => {
        if (active) setError('load_failed');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const handleDownload = () => {
    if (!certificate) return;
    const title = language === 'vi' ? certificate.titleVi : certificate.title;
    const issued = new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
      dateStyle: 'long',
    }).format(new Date(certificate.issuedAt));
    const blob = buildCertificatePdfBlob([
      title,
      certificate.candidateName,
      `${t('practice.certificate.score')}: ${certificate.score}`,
      issued,
    ]);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${certificate.id}.pdf`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-2xl space-y-6">
        {error ? (
          <p className="rounded-lg border border-error/20 bg-error-bg px-4 py-3 text-sm text-error">
            {t('practice.certificate.error')}
          </p>
        ) : null}

        {certificate ? (
          <article className="rounded-2xl border border-subtle bg-surface-raised p-8 text-center shadow-sm">
            <p className="text-label text-muted-foreground">{t('practice.certificate.issued')}</p>
            <h1 className="heading-primary mt-3 text-3xl text-foreground">
              {language === 'vi' ? certificate.titleVi : certificate.title}
            </h1>
            <p className="body-text mt-4 text-sm text-muted-foreground">{certificate.candidateName}</p>
            <p className="mt-6 text-5xl font-semibold text-foreground">{certificate.score}</p>
            <p className="text-sm text-muted-foreground">{t('practice.certificate.score')}</p>
            <p className="mt-6 text-sm text-muted-foreground">
              {new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
                dateStyle: 'long',
              }).format(new Date(certificate.issuedAt))}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={handleDownload}>
                <Download className="h-4 w-4" aria-hidden />
                {t('practice.certificate.download')}
              </button>
              <Link to={`/candidate/practice/history/${certificate.interviewId}`} className="btn-secondary">
                {t('practice.certificate.viewResult')}
              </Link>
            </div>
          </article>
        ) : null}
      </div>
    </div>
  );
};
