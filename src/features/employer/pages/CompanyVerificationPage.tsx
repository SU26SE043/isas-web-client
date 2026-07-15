import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/shared/languages';
import { EmployerStatusBadge } from '../components/EmployerStatusBadge';
import { VerificationUploadForm } from '../components/VerificationUploadForm';
import { useEmployerWorkspace } from '../hooks/useEmployerWorkspace';
import type { VerificationInput, VerificationStatus } from '../types/employer.types';

const statusCopyKey: Record<VerificationStatus, string> = {
  draft: 'employer.verify.draftCopy',
  pending: 'employer.verify.pendingCopy',
  verified: 'employer.verify.verifiedCopy',
  rejected: 'employer.verify.rejectedCopy',
};

export function CompanyVerificationPage() {
  const { t } = useLanguage();
  const { workspace, isLoading, submitVerification } = useEmployerWorkspace();

  const handleSubmit = async (input: VerificationInput) => {
    await submitVerification(input);
  };

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <p className="text-label text-muted-foreground">{t('employer.verify.eyebrow')}</p>
          <h1 className="heading-primary text-3xl text-foreground">{t('employer.verify.title')}</h1>
          <p className="body-text max-w-3xl text-sm text-muted-foreground">{t('employer.verify.subtitle')}</p>
        </header>

        {isLoading || !workspace ? (
          <Skeleton className="h-96 w-full" />
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <Card className="border border-subtle bg-surface-raised">
              <CardHeader>
                <CardTitle>{t('employer.verify.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                {workspace.verification.status === 'rejected' && workspace.verification.reviewerNote ? (
                  <Alert variant="error" className="mb-5">
                    <AlertDescription>
                      {t('employer.verify.reviewerNote').replace('{note}', workspace.verification.reviewerNote)}
                    </AlertDescription>
                  </Alert>
                ) : null}
                <VerificationUploadForm verification={workspace.verification} onSubmit={handleSubmit} />
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="border border-subtle bg-surface-raised">
                <CardHeader className="gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle>{t('employer.verify.currentStatus')}</CardTitle>
                    <EmployerStatusBadge status={workspace.verification.status} />
                  </div>
                </CardHeader>
                <CardContent className="flex gap-3 text-sm text-muted-foreground">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <p>{t(statusCopyKey[workspace.verification.status])}</p>
                </CardContent>
              </Card>

              <Card className="border border-subtle bg-surface-raised">
                <CardHeader>
                  <CardTitle>{t('employer.verify.requirements')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {[t('employer.verify.requirementOne'), t('employer.verify.requirementTwo'), t('employer.verify.requirementThree')].map(
                      (item) => (
                        <li key={item} className="flex gap-2">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                          <span>{item}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
