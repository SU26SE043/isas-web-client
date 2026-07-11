import { useState } from 'react';
import type { FormEvent } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';

interface ScoreOverrideFormProps {
  defaultScore: number;
  locked: boolean;
  onSubmit: (score: number, note: string) => Promise<void>;
}

export function ScoreOverrideForm({ defaultScore, locked, onSubmit }: ScoreOverrideFormProps) {
  const { t } = useLanguage();
  const [score, setScore] = useState(defaultScore);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(false);
    if (note.trim().length < 20) {
      setError(t('employerAnalytics.report.noteTooShort'));
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit(score, note);
      setSaved(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (locked) {
    return <Alert variant="warning"><AlertDescription>{t('employerAnalytics.report.locked')}</AlertDescription></Alert>;
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {saved ? <Alert variant="success"><AlertDescription>{t('employerAnalytics.report.overrideSaved')}</AlertDescription></Alert> : null}
      {error ? <Alert variant="error"><AlertDescription>{error}</AlertDescription></Alert> : null}
      <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
        <div className="space-y-2">
          <Label htmlFor="override-score">{t('employerAnalytics.report.overrideScore')}</Label>
          <Input id="override-score" type="number" min={0} max={100} value={score} onChange={(event) => setScore(Number(event.target.value))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="override-note">{t('employerAnalytics.report.overrideNote')}</Label>
          <textarea
            id="override-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="min-h-20 w-full rounded-lg border border-input bg-surface-overlay px-3 py-2 text-sm text-foreground"
          />
        </div>
      </div>
      <Button type="submit" loading={isSubmitting}>{t('employerAnalytics.report.overrideSubmit')}</Button>
    </form>
  );
}
