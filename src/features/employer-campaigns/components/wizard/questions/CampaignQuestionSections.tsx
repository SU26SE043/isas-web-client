import type { RefObject } from 'react';
import { useLanguage } from '@/shared/languages';
import type { CampaignQuestion } from '../../../types/campaignManagement.types';
import { CampaignQuestionCard } from './CampaignQuestionCard';

interface CampaignQuestionSectionsProps {
  questions: CampaignQuestion[];
  isDraft: boolean;
  disabled?: boolean;
  drawMode: boolean;
  listRef?: RefObject<HTMLUListElement | null>;
  onChangePrompt: (id: string, prompt: string) => void;
  onToggleRequired: (id: string, isRequired: boolean) => void;
  onChangeGroup: (id: string, group: string) => void;
  onMoveQuestion: (id: string, direction: 'up' | 'down') => void;
  onRemoveQuestion: (id: string) => void;
}

function QuestionList({
  questions,
  allQuestions,
  title,
  description,
  listRef,
  disabled,
  onChangePrompt,
  onToggleRequired,
  onChangeGroup,
  onMoveQuestion,
  onRemoveQuestion,
}: Omit<CampaignQuestionSectionsProps, 'isDraft' | 'drawMode'> & {
  allQuestions: CampaignQuestion[];
  title: string;
  description: string;
}) {
  const { t } = useLanguage();
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{t(title)}</h3>
        <p className="text-xs text-muted-foreground">{t(description)}</p>
      </div>
      <ul ref={listRef} className="space-y-3">
        {questions.map((question) => {
          const index = allQuestions.findIndex((item) => item.id === question.id);
          return (
            <CampaignQuestionCard
              key={question.id}
              question={question}
              index={index}
              total={allQuestions.length}
              disabled={disabled}
              onChangePrompt={(prompt) => onChangePrompt(question.id, prompt)}
              onToggleRequired={(isRequired) => onToggleRequired(question.id, isRequired)}
              onChangeGroup={(group) => onChangeGroup(question.id, group)}
              onMoveUp={() => onMoveQuestion(question.id, 'up')}
              onMoveDown={() => onMoveQuestion(question.id, 'down')}
              onRemove={() => onRemoveQuestion(question.id)}
            />
          );
        })}
      </ul>
    </section>
  );
}

export function CampaignQuestionSections({
  questions,
  isDraft,
  disabled = false,
  drawMode,
  listRef,
  onChangePrompt,
  onToggleRequired,
  onChangeGroup,
  onMoveQuestion,
  onRemoveQuestion,
}: CampaignQuestionSectionsProps) {
  const fixed = questions.filter((question) => question.isRequired);
  const pool = questions.filter((question) => !question.isRequired);
  const shared = {
    allQuestions: questions,
    disabled: !isDraft || disabled,
    onChangePrompt,
    onToggleRequired,
    onChangeGroup,
    onMoveQuestion,
    onRemoveQuestion,
  };

  if (!drawMode) {
    return (
      <QuestionList
        {...shared}
        questions={questions}
        listRef={listRef}
        title="employer.campaigns.campaignQuestions.fixed.title"
        description="employer.campaigns.campaignQuestions.fixed.description"
      />
    );
  }

  return (
    <div className="space-y-6">
      <QuestionList
        {...shared}
        questions={fixed}
        listRef={listRef}
        title="employer.campaigns.campaignQuestions.fixed.title"
        description="employer.campaigns.campaignQuestions.fixed.description"
      />
      <QuestionList
        {...shared}
        questions={pool}
        title="employer.campaigns.campaignQuestions.pool.title"
        description="employer.campaigns.campaignQuestions.pool.description"
      />
    </div>
  );
}
