import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  type LiveReportTab,
  parseLiveReportTab,
  parseQuestionIndex,
} from '../components/result/liveReportTabs';

export function useLiveReportTabs(questionCount: number) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = parseLiveReportTab(searchParams.get('tab'));
  const activeQuestionIndex = parseQuestionIndex(searchParams.get('question'), questionCount);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const questionParam = searchParams.get('question');
    const next = new URLSearchParams(searchParams);
    let changed = false;

    if (tabParam !== activeTab) {
      next.set('tab', activeTab);
      changed = true;
    }

    if (activeTab === 'questions') {
      const expected = String(activeQuestionIndex + 1);
      if (questionParam !== expected) {
        next.set('question', expected);
        changed = true;
      }
    } else if (questionParam != null) {
      next.delete('question');
      changed = true;
    }

    if (changed) {
      setSearchParams(next, { replace: true });
    }
  }, [activeQuestionIndex, activeTab, questionCount, searchParams, setSearchParams]);

  const setActiveTab = (tab: LiveReportTab) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', tab);
        if (tab === 'questions') {
          next.set('question', '1');
        } else {
          next.delete('question');
        }
        return next;
      },
      { replace: true },
    );
  };

  const setActiveQuestionIndex = (index: number) => {
    const safeIndex =
      questionCount <= 0 ? 0 : Math.min(Math.max(index, 0), questionCount - 1);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', 'questions');
        next.set('question', String(safeIndex + 1));
        return next;
      },
      { replace: true },
    );
  };

  return {
    activeTab,
    activeQuestionIndex,
    setActiveTab,
    setActiveQuestionIndex,
  };
}
