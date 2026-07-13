import { Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import type { SupportPriority, SupportTicketInput } from '../types/engagement.types';

interface SupportTicketFormProps {
  onCreate: (input: SupportTicketInput) => Promise<void>;
}

export function SupportTicketForm({ onCreate }: SupportTicketFormProps) {
  const { t } = useLanguage();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<SupportPriority>('normal');
  const [saved, setSaved] = useState(false);

  const submit = async () => {
    if (!subject.trim() || !description.trim()) return;
    await onCreate({ subject, description, priority });
    setSubject('');
    setDescription('');
    setPriority('normal');
    setSaved(true);
  };

  return (
    <section className="space-y-4 rounded-xl border border-subtle bg-surface-raised p-5">
      {saved ? <p className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">{t('engagement.support.created')}</p> : null}
      <div className="space-y-2">
        <Label htmlFor="subject">{t('engagement.support.subject')}</Label>
        <Input id="subject" value={subject} onChange={(event) => setSubject(event.target.value)} />
      </div>
      <label className="grid gap-2 text-sm font-medium text-foreground">
        {t('engagement.support.priority')}
        <select className="h-8 rounded-lg border border-input bg-surface-overlay px-2 text-sm" value={priority} onChange={(event) => setPriority(event.target.value as SupportPriority)}>
          {(['low', 'normal', 'high'] as SupportPriority[]).map((item) => <option key={item} value={item}>{t(`engagement.priority.${item}`)}</option>)}
        </select>
      </label>
      <div className="space-y-2">
        <Label htmlFor="description">{t('engagement.support.descriptionField')}</Label>
        <textarea id="description" rows={5} className="w-full rounded-lg border border-input bg-surface-overlay px-3 py-2 text-sm text-foreground" value={description} onChange={(event) => setDescription(event.target.value)} />
      </div>
      <Button type="button" onClick={submit}>
        <Send aria-hidden />
        {t('engagement.support.submit')}
      </Button>
    </section>
  );
}
