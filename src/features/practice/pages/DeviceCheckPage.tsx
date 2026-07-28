import { Navigate, useParams } from 'react-router-dom';
import { normalizePracticeSessionId } from '../utils/practiceSessionLoad';

/** Legacy route — device check now lives in interview preparation step 2. */
export function DeviceCheckPage() {
  const { sessionId: routeSessionId } = useParams<{ sessionId: string }>();
  const sessionId = normalizePracticeSessionId(routeSessionId);
  if (!sessionId) {
    return <Navigate to="/practice" replace />;
  }
  return <Navigate to={`/interview/${sessionId}/prepare?step=device`} replace />;
}
