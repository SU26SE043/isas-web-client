import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { TeamInviteInput, TeamMember, TeamRole } from '../types/engagement.types';

interface TeamMemberTableProps {
  team: TeamMember[];
  onInvite: (input: TeamInviteInput) => Promise<void>;
}

export function TeamMemberTable({ team, onInvite }: TeamMemberTableProps) {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TeamRole>('HrMember');
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';

  const invite = async () => {
    if (!email.trim()) return;
    await onInvite({ email, role });
    setEmail('');
  };

  return (
    <section className="space-y-5">
      <div className="grid gap-3 rounded-xl border border-subtle bg-surface-raised p-4 md:grid-cols-[1fr_180px_auto]">
        <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t('engagement.team.email')} />
        <select className="h-8 rounded-lg border border-input bg-surface-overlay px-2 text-sm" value={role} onChange={(event) => setRole(event.target.value as TeamRole)}>
          {(['HrMember', 'OrgAdmin'] as TeamRole[]).map((item) => <option key={item} value={item}>{t(`engagement.team.role.${item}`)}</option>)}
        </select>
        <Button type="button" onClick={invite}>
          <UserPlus aria-hidden />
          {t('engagement.team.invite')}
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('engagement.team.member')}</TableHead>
            <TableHead>{t('engagement.team.role')}</TableHead>
            <TableHead>{t('engagement.team.status')}</TableHead>
            <TableHead>{t('engagement.team.lastActive')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {team.map((member) => (
            <TableRow key={member.id}>
              <TableCell><p className="font-medium text-foreground">{member.name}</p><p className="text-xs text-muted-foreground">{member.email}</p></TableCell>
              <TableCell className="text-foreground">{t(`engagement.team.role.${member.role}`)}</TableCell>
              <TableCell className="text-foreground">{t(`engagement.team.status.${member.status}`)}</TableCell>
              <TableCell>{new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(member.lastActiveAt))}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-xs text-muted-foreground">{t('engagement.team.roleRule')}</p>
    </section>
  );
}
