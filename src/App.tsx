import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { HomePage } from './features/home/pages/HomePage';
import { CVAnalysisPage } from './features/cv-analysis/pages/CVAnalysisPage';
import { CVResultPage } from './features/cv-analysis/pages/CVResultPage';
import { ProfilePage } from './features/auth/pages/ProfilePage';
import { PracticeInterviewPage } from './features/practice/pages/PracticeInterviewPage';
import { InterviewResultPage } from './features/practice/pages/InterviewResultPage';
import { InterviewHistoryPage } from './features/practice/pages/InterviewHistoryPage';
import { LanguageProvider } from './shared/languages';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { UserRole } from './features/auth/types/auth.types';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          {/* Practice Interview Route - Requires Candidate or Admin role */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.CANDIDATE, UserRole.ADMIN]} />}>
            <Route path="/practice" element={<PracticeInterviewPage />} />
            <Route path="/practice/result" element={<InterviewResultPage />} />
            <Route path="/practice/interview/:id" element={<InterviewResultPage />} />
          </Route>

          {/* Main Layout Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="cv-analysis" element={<CVAnalysisPage />} />
              <Route path="cv-analysis/result" element={<CVResultPage />} />
            </Route>

            {/* Dashboard Layout Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="profile" element={<ProfilePage />} />
                <Route path="practice/history" element={<InterviewHistoryPage />} />
              </Route>
            </Route>

            {/* We will add more routes here later */}
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
