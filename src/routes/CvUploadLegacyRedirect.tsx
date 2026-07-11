import { Navigate } from 'react-router-dom';

export function CvUploadLegacyRedirect() {
  return <Navigate to="/candidate/cv/analysis" replace />;
}
