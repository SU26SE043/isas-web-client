import { useNavigate, useParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/shared/languages';
import { useEmployerCampaign } from '../hooks/useEmployerCampaigns';
import { CampaignWizardForm } from '../components/wizard/CampaignWizardForm';
import type { CampaignDraftInput } from '../types/campaignManagement.types';

export function CampaignWizardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { campaign, questions, isLoading, saveDraft, publish } = useEmployerCampaign(id);
  const isEditing = Boolean(id);

  const handleSaveDraft = async (input: CampaignDraftInput) => {
    const saved = await saveDraft(input, id);
    if (!id) {
      navigate(`/employer/campaigns/${saved.id}/edit`, { replace: true });
    }
    return saved;
  };

  const handlePublish = async (input: CampaignDraftInput) => {
    const saved = await saveDraft(input, id);
    const result = await publish(saved.id);
    if (result.warnings.length > 0) {
      throw new Error(
        result.warnings
          .map((warning) => t(`employer.campaigns.detail.warning.${warning}`))
          .join(' · '),
      );
    }
    navigate(`/employer/campaigns/${saved.id}`);
    return result.campaign;
  };

  if (isLoading && isEditing) {
    return (
      <div className="flex min-h-[calc(100dvh-3.5rem)] items-center justify-center bg-surface-base p-8">
        <Skeleton className="h-96 w-full max-w-5xl" />
      </div>
    );
  }

  return (
    <CampaignWizardForm
      campaign={campaign}
      questions={questions}
      isEditing={isEditing}
      onSaveDraft={handleSaveDraft}
      onPublish={handlePublish}
    />
  );
}
