import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './features/home/pages/HomePage';
import { CVAnalysisPage } from './features/cv-analysis/pages/CVAnalysisPage';
import { CVResultPage } from './features/cv-analysis/pages/CVResultPage';
import { ProfilePage } from './features/auth/pages/ProfilePage';
import { LanguageProvider } from './shared/languages';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="cv-analysis" element={<CVAnalysisPage />} />
            <Route path="cv-analysis/result" element={<CVResultPage />} />
            <Route path="profile" element={<ProfilePage />} />
            {/* We will add more routes here later */}
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
