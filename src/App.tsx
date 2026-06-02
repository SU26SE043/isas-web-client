import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './features/home/pages/HomePage';
import { CVAnalysisPage } from './features/cv-analysis/pages/CVAnalysisPage';
import { CVResultPage } from './features/cv-analysis/pages/CVResultPage';
import { ProfilePage } from './features/auth/pages/ProfilePage';
import { PracticeInterviewPage } from './features/practice/pages/PracticeInterviewPage';
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
          </Route>

          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            
            {/* Protected Routes inside MainLayout */}
            <Route element={<ProtectedRoute />}>
              <Route path="cv-analysis" element={<CVAnalysisPage />} />
              <Route path="cv-analysis/result" element={<CVResultPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            
            {/* We will add more routes here later */}
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
