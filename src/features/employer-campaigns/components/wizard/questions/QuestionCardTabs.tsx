import * as React from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';

export type QuestionCardTab = 'content' | 'preview';

export interface QuestionCardTabsProps {
  questionId: string;
  active: QuestionCardTab;
  onChange: (tab: QuestionCardTab) => void;
  /** Trạng thái chấm thử của CHÍNH câu này — hiện trên tab để thấy được cả khi đang ở tab Nội dung. */
  previewStatus: 'idle' | 'running' | 'done';
}

const TABS: QuestionCardTab[] = ['content', 'preview'];

export const questionTabId = (questionId: string, tab: QuestionCardTab) => `q-tab-${tab}-${questionId}`;
export const questionTabPanelId = (questionId: string, tab: QuestionCardTab) => `q-tabpanel-${tab}-${questionId}`;

/**
 * Tách card câu hỏi thành "Nội dung" (soạn) và "Chấm thử" (thử bộ chấm) — trước đây hai việc xếp chồng trong một
 * cột ~1.600px. Tab gạch chân (không phải segmented nền đen): mở vài card cùng lúc thì nhiều thanh đen tranh chú ý
 * với nút điều hướng của wizard. ←/→ chuyển tab như WAI-ARIA tabs.
 */
export function QuestionCardTabs({ questionId, active, onChange, previewStatus }: QuestionCardTabsProps) {
  const { t } = useLanguage();
  const refs = React.useRef<Record<QuestionCardTab, HTMLButtonElement | null>>({ content: null, preview: null });

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const next = TABS[(TABS.indexOf(active) + 1) % TABS.length];
    onChange(next);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={t('employer.campaigns.questionCard.tabs.label')}
      onKeyDown={onKeyDown}
      className="flex gap-5 border-b border-satin"
    >
      {TABS.map((tab) => {
        const isActive = active === tab;
        return (
          <button
            key={tab}
            ref={(node) => { refs.current[tab] = node; }}
            type="button"
            role="tab"
            id={questionTabId(questionId, tab)}
            aria-selected={isActive}
            aria-controls={questionTabPanelId(questionId, tab)}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab)}
            className={cn(
              '-mb-px inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 px-0.5 pb-2 pt-1 text-sm font-medium outline-none transition-colors duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]',
              isActive
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:border-satin hover:text-foreground',
            )}
          >
            {t(`employer.campaigns.questionCard.tabs.${tab}`)}
            {tab === 'preview' && previewStatus === 'running' ? (
              <>
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                <span className="sr-only">{t('employer.campaigns.rubricPreview.running')}</span>
              </>
            ) : null}
            {tab === 'preview' && previewStatus === 'done' ? (
              <>
                <CheckCircle2 className="size-3.5 text-success" aria-hidden />
                <span className="sr-only">{t('employer.campaigns.questionCard.previewDone')}</span>
              </>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
