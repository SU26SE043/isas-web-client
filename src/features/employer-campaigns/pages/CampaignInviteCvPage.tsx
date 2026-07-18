import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import { useEmployerCampaign } from '../hooks/useEmployerCampaigns';
import { campaignManagementService } from '../services/campaignManagement.service';
import type { RankedCandidate } from '../types/campaignWizard.types';

export function CampaignInviteCvPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { campaign } = useEmployerCampaign(id);
  const [ranked, setRanked] = useState<RankedCandidate[]>([]);
  const [threshold, setThreshold] = useState(70);
  const [isUploading, setIsUploading] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(() => ranked.filter((row) => row.selected), [ranked]);

  useEffect(() => {
    if (campaign && campaign.status !== 'active') {
      navigate(`/employer/campaigns/${id}/invite`, { replace: true });
    }
  }, [campaign, id, navigate]);

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setIsUploading(true);
    setError(null);
    try {
      const files = Array.from(fileList);
      const result = await campaignManagementService.uploadCandidateCvs(id, files);
      setRanked(
        result.candidates.map((item) => ({
          id: item.id,
          name: item.fullName,
          email: item.email,
          overallMatch: item.overallMatch,
          technicalMatch: item.overallMatch,
          experienceMatch: item.overallMatch,
          skillsMatch: item.overallMatch,
          selected: item.overallMatch >= threshold,
          status: item.status,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t('employer.campaigns.inviteFlow.uploadFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleInvite = async () => {
    if (selected.length === 0) {
      setError(t('employer.campaigns.wizard.candidatesRequired'));
      return;
    }
    setIsInviting(true);
    setError(null);
    try {
      const result = await campaignManagementService.inviteCandidateIds(
        id,
        selected.map((row) => row.id),
        selected.map((row) => ({ id: row.id, email: row.email, fullName: row.name })),
      );
      navigate(`/employer/campaigns/${id}/invite/result`, {
        state: {
          method: 'cv',
          invited: result.invited.map((item) => ({
            email: item.email,
            invitationId: item.invitationId,
          })),
          failed: result.failed.map((item) => ({
            email: item.candidateId,
            reason: item.reason,
          })),
          submittedAt: new Date().toISOString(),
        },
        replace: true,
      });
      toast.success(t('employer.campaigns.inviteFlow.inviteSuccess'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('employer.campaigns.inviteFlow.inviteFailed'));
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-5xl space-y-6">
        <Link
          to={`/employer/campaigns/${id}/invite`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {t('employer.campaigns.inviteFlow.backToMethod')}
        </Link>

        <header className="space-y-1">
          <h1 className="heading-primary text-3xl text-foreground">
            {t('employer.campaigns.inviteFlow.cvTitle')}
          </h1>
          <p className="text-sm text-muted-foreground">{t('employer.campaigns.inviteFlow.cvDesc')}</p>
        </header>

        {error ? (
          <p className="rounded-lg border border-error/40 bg-error-bg px-3 py-2 text-sm text-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="rounded-lg border border-dashed border-satin bg-surface-overlay px-4 py-6 text-center">
          <Label htmlFor="cv-upload" className="cursor-pointer text-sm font-medium text-foreground">
            {isUploading
              ? t('employer.campaigns.inviteFlow.uploading')
              : t('employer.campaigns.inviteFlow.uploadCvs')}
          </Label>
          <Input
            id="cv-upload"
            type="file"
            accept=".pdf"
            multiple
            className="mt-3"
            disabled={isUploading || isInviting}
            onChange={(e) => void handleUpload(e.target.files)}
          />
        </div>

        {ranked.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-2">
                <Label htmlFor="threshold">{t('employer.campaigns.form.matchThreshold')}</Label>
                <Input
                  id="threshold"
                  type="number"
                  min={0}
                  max={100}
                  className="w-28"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value) || 0)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setRanked((prev) =>
                    prev.map((row) => ({ ...row, selected: row.overallMatch >= threshold })),
                  )
                }
              >
                {t('employer.campaigns.wizard.selectAboveThreshold')}
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-satin">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b border-satin bg-surface-overlay text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">{t('employer.campaigns.wizard.select')}</th>
                    <th className="px-3 py-2">{t('employer.campaigns.detail.candidateName')}</th>
                    <th className="px-3 py-2">{t('employer.campaigns.detail.candidateEmail')}</th>
                    <th className="px-3 py-2">{t('employer.campaigns.form.overallMatch')}</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((row) => (
                    <tr key={row.id} className="border-b border-satin last:border-0">
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={() =>
                            setRanked((prev) =>
                              prev.map((item) =>
                                item.id === row.id ? { ...item, selected: !item.selected } : item,
                              ),
                            )
                          }
                          className="size-4 rounded border-satin"
                          aria-label={row.name}
                        />
                      </td>
                      <td className="px-3 py-2 text-foreground">{row.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.email}</td>
                      <td className="px-3 py-2 text-foreground">{row.overallMatch}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-satin bg-surface-elevated px-4 py-3">
              <p className="text-sm text-muted-foreground">
                {t('employer.campaigns.wizard.selectedCount').replace(
                  '{count}',
                  String(selected.length),
                )}
              </p>
              <Button type="button" disabled={isInviting || selected.length === 0} loading={isInviting} onClick={() => void handleInvite()}>
                {t('employer.campaigns.inviteFlow.sendSelected')}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
