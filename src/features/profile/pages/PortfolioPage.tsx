import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import { ProfileSectionLayout } from '../components/ProfileSectionLayout';
import { ProfileSectionRowActions } from '../components/ProfileSectionRowActions';
import { PortfolioForm } from '../components/PortfolioForm';
import { useProfile } from '../hooks/useProfile';
import { profileService } from '../services/profile.service';
import type { PortfolioProject } from '../types/profile.types';

export const PortfolioPage: React.FC = () => {
  const { t } = useLanguage();
  const { profile, completeness, isLoading, reload } = useProfile();
  const [editing, setEditing] = useState<PortfolioProject | 'new' | null>(null);

  if (isLoading || !profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  const handleSave = async (data: Omit<PortfolioProject, 'id'>) => {
    if (editing && editing !== 'new') await profileService.updatePortfolio(editing.id, data);
    else await profileService.addPortfolio(data);
    setEditing(null);
    await reload();
  };

  return (
    <ProfileSectionLayout
      title={t('profile.portfolio.title')}
      description={t('profile.portfolio.subtitle')}
      completeness={completeness}
    >
      <div className="space-y-4">
        {profile.portfolio.length === 0 && !editing ? (
          <p className="text-sm text-muted-foreground">{t('profile.portfolio.empty')}</p>
        ) : (
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow>
                <TableHead>{t('profile.portfolio.projectTitle')}</TableHead>
                <TableHead>{t('profile.portfolio.techStack')}</TableHead>
                <TableHead>{t('profile.portfolio.url')}</TableHead>
                <TableHead className="text-right">{t('profile.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profile.portfolio.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">{item.title}</p>
                    {item.description ? (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                    ) : null}
                  </TableCell>
                  <TableCell>{item.techStack}</TableCell>
                  <TableCell>
                    {item.url ? (
                      <a
                        href={item.url}
                        className="text-sm text-foreground underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t('profile.view.openLink')}
                      </a>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    <ProfileSectionRowActions
                      editLabel={t('profile.portfolio.edit')}
                      deleteLabel={t('profile.portfolio.delete')}
                      onEdit={() => setEditing(item)}
                      onDelete={() => void profileService.deletePortfolio(item.id).then(reload)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {editing ? (
          <div className="rounded-xl border border-satin bg-white/[0.03] p-4">
            <PortfolioForm
              initial={editing === 'new' ? undefined : editing}
              onSubmit={handleSave}
              onCancel={() => setEditing(null)}
            />
          </div>
        ) : (
          <button type="button" className="btn-primary" onClick={() => setEditing('new')}>
            {t('profile.portfolio.add')}
          </button>
        )}
      </div>
    </ProfileSectionLayout>
  );
};
