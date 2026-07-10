import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '@/components/BrandLogo';

interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="surface-raised w-full rounded-xl border border-subtle p-6 sm:p-8">
      <Link to="/" className="mb-6 inline-flex focus-ring rounded-md">
        <BrandLogo />
      </Link>
      <h1 className="heading-primary text-2xl">{title}</h1>
      {description ? <p className="body-text mt-2">{description}</p> : null}
      <div className="mt-6">{children}</div>
      {footer ? <div className="mt-6 border-t border-subtle pt-4 text-center text-sm">{footer}</div> : null}
    </div>
  );
}
