import React from 'react';
import { Link } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';

interface ProfileSectionCardProps {
  title: string;
  editHref?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const ProfileSectionCard: React.FC<ProfileSectionCardProps> = ({
  title,
  editHref,
  children,
  className,
  id,
}) => {
  const { t } = useLanguage();

  return (
    <section
      id={id}
      className={cn('overflow-hidden rounded-xl border border-subtle bg-surface-raised', className)}
      aria-labelledby={id ? `${id}-title` : undefined}
    >
      <div className="flex items-center justify-between gap-3 border-b border-subtle px-4 py-3 sm:px-5 sm:py-4">
        <h2 id={id ? `${id}-title` : undefined} className="heading-secondary text-base sm:text-lg">
          {title}
        </h2>
        {editHref ? (
          <Link
            to={editHref}
            className="btn-ghost inline-flex size-9 items-center justify-center rounded-lg p-0"
            aria-label={`${t('profile.view.edit')}: ${title}`}
          >
            <Pencil className="size-4" aria-hidden />
          </Link>
        ) : null}
      </div>
      <div className="px-4 py-4 sm:px-5 sm:py-5">{children}</div>
    </section>
  );
};
