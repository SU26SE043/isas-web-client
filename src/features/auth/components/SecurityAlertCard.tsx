import React from 'react';
import { useLanguage } from '../../../shared/languages';

export const SecurityAlertCard: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-slate-800" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-900 mb-1">{t('profile.accountSecurity')}</h3>
          <p className="text-sm font-medium text-gray-700 mb-4">
            Hãy đảm bảo thông tin tài khoản luôn được cập nhật để bảo mật và nhận thông báo quan trọng.
          </p>
          <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold py-2.5 px-4 rounded-lg transition-colors">
            {t('profile.updateInfo')}
          </button>
        </div>
      </div>
    </div>
  );
};