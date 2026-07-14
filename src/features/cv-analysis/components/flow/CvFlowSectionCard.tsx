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
  <section
    className={cn(
      'overflow-hidden rounded-2xl border border-white/10 bg-[rgb(18_18_20/0.55)] shadow-[var(--shadow-md)] backdrop-blur-xl',
      className,
    )}
  >
    <div className="border-b border-white/8 px-5 py-5 sm:px-7 sm:py-6">
      <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">{title}</h2>
      {description ? (
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
    <div className="px-5 py-6 sm:px-7 sm:py-7">{children}</div>
  </section>
);
