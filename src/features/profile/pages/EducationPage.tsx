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
import { EducationForm } from '../components/EducationForm';
import { useProfile } from '../hooks/useProfile';
import { profileService } from '../services/profile.service';
import type { Education } from '../types/profile.types';

export const EducationPage: React.FC = () => {
  const { t } = useLanguage();
  const { profile, completeness, isLoading, reload } = useProfile();
  const [editing, setEditing] = useState<Education | 'new' | null>(null);

  if (isLoading || !profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  const handleSave = async (data: Omit<Education, 'id'>) => {
    if (editing && editing !== 'new') {
      await profileService.updateEducation(editing.id, data);
    } else {
      await profileService.addEducation(data);
    }
    setEditing(null);
    await reload();
  };

  const handleDelete = async (id: string) => {
    await profileService.deleteEducation(id);
    await reload();
  };

  return (
    <ProfileSectionLayout
      title={t('profile.education.title')}
      description={t('profile.education.subtitle')}
      completeness={completeness}
    >
      <div className="space-y-4">
        {profile.education.length === 0 && !editing ? (
          <p className="text-sm text-muted-foreground">{t('profile.education.empty')}</p>
        ) : (
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow>
                <TableHead>{t('profile.education.degree')}</TableHead>
                <TableHead>{t('profile.education.school')}</TableHead>
                <TableHead>{t('profile.education.field')}</TableHead>
                <TableHead>{t('profile.table.period')}</TableHead>
                <TableHead className="text-right">{t('profile.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profile.education.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-foreground">{item.degree}</TableCell>
                  <TableCell>{item.school}</TableCell>
                  <TableCell>{item.fieldOfStudy}</TableCell>
                  <TableCell>
                    {item.startDate} — {item.isCurrent ? t('profile.education.current') : item.endDate}
                  </TableCell>
                  <TableCell>
                    <ProfileSectionRowActions
                      editLabel={t('profile.education.edit')}
                      deleteLabel={t('profile.education.delete')}
                      onEdit={() => setEditing(item)}
                      onDelete={() => void handleDelete(item.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {editing ? (
          <div className="rounded-xl border border-satin bg-white/[0.03] p-4">
            <EducationForm
              initial={editing === 'new' ? undefined : editing}
              onSubmit={handleSave}
              onCancel={() => setEditing(null)}
            />
          </div>
        ) : (
          <button type="button" className="btn-primary" onClick={() => setEditing('new')}>
            {t('profile.education.add')}
          </button>
        )}
      </div>
    </ProfileSectionLayout>
  );
};
