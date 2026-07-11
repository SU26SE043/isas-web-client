import { Navigate, useParams } from 'react-router-dom';

export function InviteEntryPage() {
  const { token = '' } = useParams();
  const sessionId = token || 'session-123';
  return <Navigate to={`/interview/${sessionId}/prepare`} replace />;
}
