import { Navigate, useLocation, useParams } from 'react-router-dom';

const LEGACY_REDIRECTS: Record<string, string> = {
  '/profile': '/candidate/profile',
  '/cv-analysis': '/candidate/cv/upload',
  '/cv-analysis/result': '/candidate/cv/analysis',
};

export function LegacyRedirect() {
  const location = useLocation();
  const target = LEGACY_REDIRECTS[location.pathname];

  if (!target) {
    return <Navigate to="/candidate/dashboard" replace />;
  }

  return <Navigate to={`${target}${location.search}${location.hash}`} replace />;
}

export function PracticeHistoryLegacyRedirect() {
  const { id } = useParams();
  if (!id) return <Navigate to="/candidate/practice/history" replace />;
  return <Navigate to={`/candidate/practice/history/${id}`} replace />;
}
