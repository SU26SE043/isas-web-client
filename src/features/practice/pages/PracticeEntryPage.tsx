import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useInterviewFlowStore } from '../stores/interviewFlowStore';

const DEFAULT_SESSION_ID = 'session-123';

export function PracticeEntryPage() {
  const reset = useInterviewFlowStore((state) => state.reset);

  useEffect(() => {
    reset();
  }, [reset]);

  return <Navigate to={`/interview/${DEFAULT_SESSION_ID}/prepare`} replace />;
}
