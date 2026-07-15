import React from 'react';
import { Link } from 'react-router-dom';

interface ProfileEmptyStateProps {
  message: string;
  ctaLabel: string;
  ctaHref: string;
}

export const ProfileEmptyState: React.FC<ProfileEmptyStateProps> = ({
  message,
  ctaLabel,
  ctaHref,
}) => (
  <div className="flex flex-col items-center rounded-lg border border-dashed border-subtle bg-surface-overlay/40 px-4 py-8 text-center">
    <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
    <Link to={ctaHref} className="btn-secondary mt-4 inline-flex text-sm">
      {ctaLabel}
    </Link>
  </div>
);
