import React from 'react';
import { cn } from '@/lib/utils';

interface CvFlowSectionCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const CvFlowSectionCard: React.FC<CvFlowSectionCardProps> = ({
  title,
  description,
  children,
  className,
}) => (
  <section className={cn('rounded-xl border border-subtle bg-surface-raised', className)}>
    <div className="border-b border-subtle px-4 py-4 sm:px-6">
      <h2 className="heading-secondary text-base sm:text-lg">{title}</h2>
      {description ? <p className="body-text mt-1 text-sm">{description}</p> : null}
    </div>
    <div className="px-4 py-5 sm:px-6">{children}</div>
  </section>
);
