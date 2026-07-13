import { Navigate, useLocation, useParams } from 'react-router-dom';

const LEGACY_REDIRECTS: Record<string, string> = {
  '/profile': '/candidate/profile',
  '/cv-analysis': '/candidate/cv/analysis',
  '/cv-analysis/result': '/candidate/cv/analysis/report',
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

export function CandidateResultsLegacyRedirect() {
  const { id } = useParams();
  if (!id) return <Navigate to="/candidate/practice/history" replace />;
  return <Navigate to={`/candidate/practice/history/${id}`} replace />;
}

export function CandidateHistoryLegacyRedirect() {
  return <Navigate to="/candidate/practice/history" replace />;
}

export function CampaignDiscoveryLegacyRedirect() {
  return <Navigate to="/candidate/dashboard" replace />;
}
