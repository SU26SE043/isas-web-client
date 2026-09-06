import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/shared/languages';
import type { TeamInviteInput } from '../types/engagement.types';

const inviteSchema = z.object({
  fullName: z.string().trim().min(1),
  email: z.string().trim().email(),
});

interface InviteTeamMemberFormProps {
  isSubmitting: boolean;
  onInvite: (input: TeamInviteInput) => Promise<void>;
}

export function InviteTeamMemberForm({
  isSubmitting,
  onInvite,
}: InviteTeamMemberFormProps) {
  const { t } = useLanguage();
  const form = useForm<TeamInviteInput>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { fullName: '', email: '' },
  });

  const submit = form.handleSubmit(async (input) => {
    try {
      await onInvite({ fullName: input.fullName.trim(), email: input.email.trim() });
      form.reset();
    } catch {
      // The team hook exposes a localized API error while preserving form values.
    }
  });

  return (
    <form
      onSubmit={submit}
      className="frame-satin grid gap-3 rounded-xl bg-surface-raised p-4 md:grid-cols-[1fr_1fr_auto]"
      noValidate
    >
      <div>
        <label className="text-sm font-medium text-foreground" htmlFor="team-member-name">
          {t('engagement.team.fullName')}
        </label>
        <Input
          id="team-member-name"
          autoComplete="name"
          placeholder={t('engagement.team.fullName')}
          aria-invalid={Boolean(form.formState.errors.fullName)}
          aria-describedby={form.formState.errors.fullName ? 'team-member-name-error' : undefined}
          {...form.register('fullName')}
        />
        {form.formState.errors.fullName ? (
          <p id="team-member-name-error" className="mt-1 text-xs text-error">
            {t('engagement.team.validation.fullName')}
          </p>
        ) : null}
      </div>

      <div>
        <label className="text-sm font-medium text-foreground" htmlFor="team-member-email">
          {t('engagement.team.email')}
        </label>
        <Input
          id="team-member-email"
          type="email"
          autoComplete="email"
          placeholder={t('engagement.team.email')}
          aria-invalid={Boolean(form.formState.errors.email)}
          aria-describedby={form.formState.errors.email ? 'team-member-email-error' : undefined}
          {...form.register('email')}
        />
        {form.formState.errors.email ? (
          <p id="team-member-email-error" className="mt-1 text-xs text-error">
            {t('engagement.team.validation.email')}
          </p>
        ) : null}
      </div>

      <Button type="submit" loading={isSubmitting} className="md:self-start">
        <UserPlus aria-hidden />
        {t('engagement.team.invite')}
      </Button>
    </form>
  );
}
