import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/shared/languages';
import { CampaignWizardForm } from '../components/CampaignWizardForm';
import { useEmployerCampaign } from '../hooks/useEmployerCampaigns';
import type { CampaignDraftInput } from '../types/campaignManagement.types';

export function CampaignWizardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { campaign, questions, isLoading, saveDraft } = useEmployerCampaign(id);
  const isEditing = Boolean(id);

  const handleSave = async (input: CampaignDraftInput) => {
    const saved = await saveDraft(input, id);
    navigate(`/employer/campaigns/${saved.id}`);
    return saved;
  };

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-5xl space-y-6">
        <header className="space-y-2">
          <p className="text-label text-muted-foreground">SCR-EMP-057/058</p>
          <h1 className="heading-primary text-3xl text-foreground">
            {isEditing ? t('employer.campaigns.wizard.editTitle') : t('employer.campaigns.wizard.createTitle')}
          </h1>
          <p className="body-text max-w-3xl text-sm text-muted-foreground">{t('employer.campaigns.wizard.subtitle')}</p>
        </header>
        <Card className="border border-subtle bg-surface-raised">
          <CardHeader>
            <CardTitle>
              {isEditing ? t('employer.campaigns.wizard.editTitle') : t('employer.campaigns.wizard.createTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && isEditing ? <Skeleton className="h-96 w-full" /> : (
              <CampaignWizardForm campaign={campaign} questions={questions} onSave={handleSave} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
