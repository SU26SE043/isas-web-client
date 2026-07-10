import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../shared/languages';

export const CVResultBottomPanel: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Strategic Analysis */}
      <div className="bg-surface-overlay rounded-xl p-6 lg:p-8 border border-subtle shadow-sm">
        <h3 className="text-2xl font-extrabold text-foreground mb-6">{t('result.strategicAnalysis')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Core Strengths */}
          <div>
            <h4 className="flex items-center font-bold text-foreground text-sm tracking-wider uppercase mb-4">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              {t('result.coreStrengths')}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-foreground mr-2 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-muted-foreground font-medium">{t('result.strength1')}</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-foreground mr-2 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-muted-foreground font-medium">{t('result.strength2')}</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-foreground mr-2 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-muted-foreground font-medium">{t('result.strength3')}</span>
              </li>
            </ul>
          </div>

          {/* Improvements */}
          <div>
            <h4 className="flex items-center font-bold text-error text-sm tracking-wider uppercase mb-4">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {t('result.improvements')}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-error mr-2 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm text-muted-foreground font-medium">{t('result.improvement1')}</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-error mr-2 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm text-muted-foreground font-medium">{t('result.improvement2')}</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-error mr-2 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm text-muted-foreground font-medium">{t('result.improvement3')}</span>
              </li>
            </ul>
          </div>
          
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="flex flex-col sm:flex-row flex-wrap justify-center sm:justify-end gap-4 pt-4 border-t border-subtle">
        <button 
          onClick={() => navigate('/cv-analysis')}
          className="px-6 py-3 bg-surface-raised border border-subtle text-muted-foreground rounded-xl font-bold hover:bg-surface-overlay hover:text-foreground transition-colors flex items-center justify-center shadow-sm"
        >
          <svg className="w-5 h-5 mr-2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {t('result.reuploadCv')}
        </button>
        
        <button className="px-6 py-3 bg-surface-raised border border-subtle text-muted-foreground rounded-xl font-bold hover:bg-surface-overlay hover:text-foreground transition-colors flex items-center justify-center shadow-sm">
          <svg className="w-5 h-5 mr-2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {t('result.downloadReport')}
        </button>
        
        <button className="btn-primary px-8 py-3 flex items-center justify-center">
          <svg className="w-5 h-5 mr-2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {t('result.improveCv')}
        </button>
      </div>
    </div>
  );
};
