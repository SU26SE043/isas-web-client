import React from 'react';
import { useMarketingAuthModal } from '@/layouts/MarketingAuthModalProvider';
import { CatalogPackagesGrid } from '@/features/payment/components/CatalogPackagesGrid';

/** Marketing pricing page — same package cards as `/candidate/credits`, plus Enterprise. */
export const PricingTable: React.FC = () => {
  const { openAuthModal } = useMarketingAuthModal();

  return (
    <CatalogPackagesGrid
      showEnterpriseCard
      onRequireAuth={() => openAuthModal('login')}
    />
  );
};
