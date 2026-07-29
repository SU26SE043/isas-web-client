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
import { CertificateForm } from '../components/CertificateForm';
import { useProfile } from '../hooks/useProfile';
import { profileService } from '../services/profile.service';
import type { Certificate } from '../types/profile.types';

export const CertificatesPage: React.FC = () => {
  const { t } = useLanguage();
  const { profile, completeness, isLoading, reload } = useProfile();
  const [editing, setEditing] = useState<Certificate | 'new' | null>(null);

  if (isLoading || !profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  const handleSave = async (data: Omit<Certificate, 'id'>) => {
    if (editing && editing !== 'new') await profileService.updateCertificate(editing.id, data);
    else await profileService.addCertificate(data);
    setEditing(null);
    await reload();
  };

  return (
    <ProfileSectionLayout
      title={t('profile.certificates.title')}
      description={t('profile.certificates.subtitle')}
      completeness={completeness}
    >
      <div className="space-y-4">
        {profile.certificates.length === 0 && !editing ? (
          <p className="text-sm text-muted-foreground">{t('profile.certificates.empty')}</p>
        ) : (
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow>
                <TableHead>{t('profile.certificates.name')}</TableHead>
                <TableHead>{t('profile.certificates.issuer')}</TableHead>
                <TableHead>{t('profile.certificates.issueDate')}</TableHead>
                <TableHead className="text-right">{t('profile.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profile.certificates.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                  <TableCell>{item.issuer}</TableCell>
                  <TableCell>{item.issueDate}</TableCell>
                  <TableCell>
                    <ProfileSectionRowActions
                      editLabel={t('profile.certificates.edit')}
                      deleteLabel={t('profile.certificates.delete')}
                      onEdit={() => setEditing(item)}
                      onDelete={() => void profileService.deleteCertificate(item.id).then(reload)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {editing ? (
          <div className="rounded-xl border border-satin bg-white/[0.03] p-4">
            <CertificateForm
              initial={editing === 'new' ? undefined : editing}
              onSubmit={handleSave}
              onCancel={() => setEditing(null)}
            />
          </div>
        ) : (
          <button type="button" className="btn-primary" onClick={() => setEditing('new')}>
            {t('profile.certificates.add')}
          </button>
        )}
      </div>
    </ProfileSectionLayout>
  );
};
