import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/shared/languages';
import { CompanyProfileForm } from '../components/CompanyProfileForm';
import { useEmployerWorkspace } from '../hooks/useEmployerWorkspace';
import type { CompanyProfileInput } from '../types/employer.types';

export function CompanyProfilePage() {
  const { t } = useLanguage();
  const { workspace, isLoading, saveProfile } = useEmployerWorkspace();

  const handleSave = async (input: CompanyProfileInput) => {
    await saveProfile(input);
  };

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-5xl space-y-6">
        <header className="space-y-2">
          <p className="text-label text-muted-foreground">{t('employer.company.eyebrow')}</p>
          <h1 className="heading-primary text-3xl text-foreground">{t('employer.company.title')}</h1>
          <p className="body-text max-w-3xl text-sm text-muted-foreground">{t('employer.company.subtitle')}</p>
        </header>

        <Card className="border border-subtle bg-surface-raised">
          <CardHeader>
            <CardTitle>{t('employer.company.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !workspace ? <Skeleton className="h-96 w-full" /> : (
              <CompanyProfileForm profile={workspace.profile} onSave={handleSave} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
