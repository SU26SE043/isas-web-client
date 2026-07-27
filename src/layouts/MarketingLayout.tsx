import React from 'react';
import { Outlet } from 'react-router-dom';
import { MarketingHeader } from './components/MarketingHeader';
import { MarketingFooter } from './components/MarketingFooter';
import { MarketingAuthModalProvider } from './MarketingAuthModalProvider';

export const MarketingLayout: React.FC = () => {
  return (
    <MarketingAuthModalProvider>
      <div className="flex min-h-screen flex-col surface-page">
        <MarketingHeader />
        <main className="flex-grow">
          <Outlet />
        </main>
        <MarketingFooter />
      </div>
    </MarketingAuthModalProvider>
  );
};
