import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/shared/languages';
import type { CampaignQuestion, RubricCriterion } from '../../../types/campaignManagement.types';
import { QuestionScopePicker } from './QuestionScopePicker';

export interface QuestionContentFieldsProps {
  question: CampaignQuestion;
  readOnly: boolean;
  onChangePrompt: (prompt: string) => void;
  onToggleRequired: (isRequired: boolean) => void;
  onChangeGroup: (group: string) => void;
  rubric?: RubricCriterion[];
  onChangeTargets?: (next: string[] | null) => void;
  onChangeSampleAnswer?: (text: string) => void;
  onGoToCriteria?: () => void;
}

/** Phần SOẠN của card câu hỏi (tab "Nội dung"): đề · nhóm + vị trí cùng hàng · tiêu chí nhắm tới · bài mẫu. */
export function QuestionContentFields({
  question, readOnly, onChangePrompt, onToggleRequired, onChangeGroup,
  rubric, onChangeTargets, onChangeSampleAnswer, onGoToCriteria,
}: QuestionContentFieldsProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={`q-${question.id}`} className="sr-only">
          {t('employer.campaigns.campaignQuestions.question.contentLabel')}
        </Label>
        <textarea
          id={`q-${question.id}`}
          rows={3}
          disabled={readOnly}
          className="w-full whitespace-normal rounded-lg border border-satin bg-surface-base px-3 py-2 text-sm outline-none transition focus-visible:border-[var(--border-focus)]"
          style={{ overflowWrap: 'anywhere' }}
          value={question.prompt}
          placeholder={t('employer.campaigns.campaignQuestions.question.contentPlaceholder')}
          onChange={(e) => onChangePrompt(e.target.value)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`q-group-${question.id}`}>{t('employer.campaigns.campaignQuestions.question.group')}</Label>
          <Input id={`q-group-${question.id}`} list="campaign-question-groups" value={question.questionGroup ?? ''} disabled={readOnly} placeholder={t('employer.campaigns.campaignQuestions.question.commonGroup')} onChange={(event) => onChangeGroup(event.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`q-placement-${question.id}`}>{t('employer.campaigns.campaignQuestions.question.placement')}</Label>
          <select
            id={`q-placement-${question.id}`}
            aria-label={t('employer.campaigns.campaignQuestions.question.placement')}
            value={question.isRequired ? 'fixed' : 'pool'}
            disabled={readOnly}
            onChange={(event) => onToggleRequired(event.target.value === 'fixed')}
            className="h-9 w-full rounded-lg border border-satin bg-surface-overlay/80 px-3 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="fixed">{t('employer.campaigns.campaignQuestions.question.fixed')}</option>
            <option value="pool">{t('employer.campaigns.campaignQuestions.question.pool')}</option>
          </select>
        </div>
      </div>

      {rubric && onChangeTargets ? (
        <QuestionScopePicker
          questionId={question.id}
          rubric={rubric}
          value={question.targetCriterionIds}
          disabled={readOnly}
          onChange={onChangeTargets}
          onGoToCriteria={onGoToCriteria}
        />
      ) : null}

      {onChangeSampleAnswer ? (
        <div className="space-y-1.5">
          <Label htmlFor={`q-sample-${question.id}`}>{t('employer.campaigns.questionCard.sampleAnswer.label')}</Label>
          <Textarea
            id={`q-sample-${question.id}`}
            rows={4}
            value={question.sampleAnswer ?? ''}
            disabled={readOnly}
            placeholder={t('employer.campaigns.questionCard.sampleAnswer.placeholder')}
            onChange={(event) => onChangeSampleAnswer(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">{t('employer.campaigns.questionCard.sampleAnswer.hint')}</p>
        </div>
      ) : null}
    </div>
  );
}
