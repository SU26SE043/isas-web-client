import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export type ErrorPageCode = 403 | 404 | 500;

interface ErrorPageProps {
  code: ErrorPageCode;
  title: string;
  description: string;
  actionLabel: string;
  actionHref?: string;
  onAction?: () => void;
  extra?: ReactNode;
}

export function ErrorPage({
  code,
  title,
  description,
  actionLabel,
  actionHref = '/',
  onAction,
  extra,
}: ErrorPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center surface-base px-4">
      <div className="max-w-md text-center">
        <p className="text-label mb-3">{code}</p>
        <h1 className="heading-primary text-3xl">{title}</h1>
        <p className="body-text mt-3">{description}</p>
        <div className="mt-8 flex flex-col items-center gap-3">
          {onAction ? (
            <Button type="button" onClick={onAction}>
              {actionLabel}
            </Button>
          ) : (
            <Button render={<Link to={actionHref} />}>{actionLabel}</Button>
          )}
          {extra}
        </div>
      </div>
    </main>
  );
}
