import React from 'react';
import { useLanguage } from '@/shared/languages';
import type { PortfolioProject } from '../types/profile.types';

interface PortfolioGalleryProps {
  items: PortfolioProject[];
  onEdit: (item: PortfolioProject) => void;
  onDelete: (id: string) => void;
}

export const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({
  items,
  onEdit,
  onDelete,
}) => {
  const { t } = useLanguage();

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('profile.portfolio.empty')}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {items.map((item) => (
        <article key={item.id} className="rounded-xl border border-subtle bg-surface-raised p-4">
          <h3 className="font-semibold text-foreground">{item.title}</h3>
          <p className="text-sm text-muted-foreground">{item.techStack}</p>
          <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
          {item.url ? (
            <a
              href={item.url}
              className="mt-2 inline-block text-sm text-foreground underline"
              target="_blank"
              rel="noreferrer"
            >
              {item.url}
            </a>
          ) : null}
          <div className="mt-3 flex gap-2">
            <button type="button" className="btn-secondary" onClick={() => onEdit(item)}>
              {t('profile.portfolio.edit')}
            </button>
            <button
              type="button"
              className="btn-ghost text-error"
              onClick={() => onDelete(item.id)}
            >
              {t('profile.portfolio.delete')}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
};
