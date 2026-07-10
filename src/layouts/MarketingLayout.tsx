import React from 'react';
import { Outlet } from 'react-router-dom';
import { MarketingHeader } from './components/MarketingHeader';
import { MarketingFooter } from './components/MarketingFooter';

export const MarketingLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col surface-base">
      <MarketingHeader />
      <main className="flex-grow">
        <Outlet />
      </main>
      <MarketingFooter />
    </div>
  );
};
