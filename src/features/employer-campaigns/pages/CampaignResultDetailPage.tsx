import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/patterns/EmptyState';
import { Spinner } from '@/components/ui/spinner';
import { useLanguage } from '@/shared/languages';
import { useEmployerCampaign } from '../hooks/useEmployerCampaigns';
import {
  useCampaignResultOverrideHistory,
  useCampaignResultTranscript,
  useCampaignResults,
} from '../hooks/useCampaignResults';
import { getTranscriptErrorKey } from '../utils/campaignResultsActions';
import { resultNeighbors } from '../utils/resultDetailViewModel';
import { ProctoringAnalysis } from '../components/results/ProctoringAnalysis';
import { ResultDetailHeader } from '../components/results/detail/ResultDetailHeader';
import { ResultDetailMetrics } from '../components/results/detail/ResultDetailMetrics';
import { ResultOverrideHistory } from '../components/results/detail/ResultOverrideHistory';
import { ResultQuestionCard } from '../components/results/detail/ResultQuestionCard';
import { ResultQuestionNav } from '../components/results/detail/ResultQuestionNav';

/**
 * Trang "Đánh giá chi tiết" v2 (E11c): header + điều hướng ứng viên · 4 số liệu · lịch sử điều chỉnh của HR ·
 * thẻ câu hỏi (nghe ghi âm, chỉ số cách nói, điểm tiêu chí, câu mẫu) + thanh nhảy câu · phân tích giám sát.
 * Trang chỉ orchestration: query + layout; logic hiển thị nằm ở components/results/detail/*.
 */
export function CampaignResultDetailPage() {
  const { id: campaignId = '', sessionId = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const resultsQuery = useCampaignResults(campaignId);
  const campaignQuery = useEmployerCampaign(campaignId);
  const item = resultsQuery.data?.results.find((result) => result.sessionId === sessionId) ?? null;
  const transcriptQuery = useCampaignResultTranscript(campaignId, item?.sessionId ?? null, { enabled: Boolean(item) });
  const historyQuery = useCampaignResultOverrideHistory(campaignId, item?.sessionId ?? null, { enabled: Boolean(item) });
  const backToResults = `/employer/campaigns/${campaignId}/overview?tab=results`;

  if (resultsQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="app-page">
        <EmptyState
          variant="no-results"
          title={t('employer.campaigns.results.transcript.title')}
          description={t(
            resultsQuery.isError
              ? 'employer.campaigns.results.errors.loadFailed'
              : 'employer.campaigns.results.errors.transcriptNotFound',
          )}
          action={
            <Button render={<Link to={backToResults} />} nativeButton={false} variant="outline">
              {t('employer.campaigns.results.detail.back')}
            </Button>
          }
        />
      </div>
    );
  }

  const questions = transcriptQuery.data?.questions ?? [];
  // Trước/sau theo thứ tự HẠNG server trả (không phải thứ tự bảng đã lọc/sort ở client).
  const neighbors = resultNeighbors(resultsQuery.data?.results ?? [], item.sessionId);

  return (
    // KHÔNG bọc `overflow-y-auto` như các trang employer khác: layout không kẹp chiều cao nên div đó không
    // bao giờ cuộn (document cuộn), mà một tổ tiên có overflow ≠ visible là đủ làm `position: sticky` của
    // rail/dải câu hỏi chết — đo bằng getBoundingClientRect: rail ở y = −675 sau khi nhảy tới câu 3.
    <div className="min-h-full bg-surface-base">
      <main className="app-page space-y-5">
        <Link to={backToResults} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden />
          {t('employer.campaigns.results.detail.back')}
        </Link>
        <ResultDetailHeader
          campaignName={campaignQuery.campaign?.title || campaignId}
          item={item}
          total={resultsQuery.data?.results.length ?? 0}
          questions={questions}
          previous={neighbors.previous}
          next={neighbors.next}
          onNavigate={(nextSessionId) => navigate(`/employer/campaigns/${campaignId}/results/${nextSessionId}`)}
        />
        <ResultDetailMetrics item={item} questions={questions} />
        <ResultOverrideHistory
          campaignId={campaignId}
          item={item}
          history={historyQuery.data?.items ?? []}
          isLoading={historyQuery.isLoading}
          isError={historyQuery.isError}
        />
        {transcriptQuery.isError ? (
          <Alert variant="error">
            <AlertDescription>{t(getTranscriptErrorKey(transcriptQuery.error))}</AlertDescription>
          </Alert>
        ) : null}
        {transcriptQuery.isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner className="size-8" />
          </div>
        ) : (
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_13rem]">
            <section className="space-y-4">
              {questions.map((question) => (
                <ResultQuestionCard key={question.questionId} question={question} campaignId={campaignId} sessionId={item.sessionId} />
              ))}
            </section>
            <ResultQuestionNav questions={questions} />
          </div>
        )}
        <ProctoringAnalysis flags={item.flags} />
      </main>
    </div>
  );
}
