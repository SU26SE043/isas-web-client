import React from 'react';
import { SectionPanel } from '@/components/ui/section-panel';
import { cn } from '@/lib/utils';

interface CvFlowSectionCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/** CV flow shell — wraps shared SectionPanel template. */
export const CvFlowSectionCard: React.FC<CvFlowSectionCardProps> = ({
  title,
  description,
  children,
  className,
}) => (
  <SectionPanel title={title} description={description} className={cn(className)}>
    {children}
  </SectionPanel>
);
