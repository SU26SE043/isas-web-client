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
import { ExperienceForm } from '../components/ExperienceForm';
import { useProfile } from '../hooks/useProfile';
import { profileService } from '../services/profile.service';
import type { Experience } from '../types/profile.types';

export const ExperiencePage: React.FC = () => {
  const { t } = useLanguage();
  const { profile, completeness, isLoading, reload } = useProfile();
  const [editing, setEditing] = useState<Experience | 'new' | null>(null);

  if (isLoading || !profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  const handleSave = async (data: Omit<Experience, 'id'>) => {
    if (editing && editing !== 'new') {
      await profileService.updateExperience(editing.id, data);
    } else {
      await profileService.addExperience(data);
    }
    setEditing(null);
    await reload();
  };

  return (
    <ProfileSectionLayout
      title={t('profile.experience.title')}
      description={t('profile.experience.subtitle')}
      completeness={completeness}
    >
      <div className="space-y-4">
        {profile.experiences.length === 0 && !editing ? (
          <p className="text-sm text-muted-foreground">{t('profile.experience.empty')}</p>
        ) : (
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow>
                <TableHead>{t('profile.experience.jobTitle')}</TableHead>
                <TableHead>{t('profile.experience.company')}</TableHead>
                <TableHead>{t('profile.table.period')}</TableHead>
                <TableHead className="text-right">{t('profile.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profile.experiences.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">{item.title}</p>
                    {item.description ? (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                    ) : null}
                  </TableCell>
                  <TableCell>{item.company}</TableCell>
                  <TableCell>
                    {item.startDate} — {item.isCurrent ? t('profile.experience.current') : item.endDate}
                  </TableCell>
                  <TableCell>
                    <ProfileSectionRowActions
                      editLabel={t('profile.experience.edit')}
                      deleteLabel={t('profile.experience.delete')}
                      onEdit={() => setEditing(item)}
                      onDelete={() => void profileService.deleteExperience(item.id).then(reload)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {editing ? (
          <div className="rounded-xl border border-satin bg-white/[0.03] p-4">
            <ExperienceForm
              initial={editing === 'new' ? undefined : editing}
              onSubmit={handleSave}
              onCancel={() => setEditing(null)}
            />
          </div>
        ) : (
          <button type="button" className="btn-primary" onClick={() => setEditing('new')}>
            {t('profile.experience.add')}
          </button>
        )}
      </div>
    </ProfileSectionLayout>
  );
};
