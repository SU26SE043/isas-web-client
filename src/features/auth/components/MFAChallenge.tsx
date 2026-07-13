import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import { getApiErrorMessage } from '@/shared/api';
import { authService } from '../services/authService';

export interface MFAChallengeProps {
  mfaToken: string;
  email?: string;
  onVerified: () => void | Promise<void>;
}

export function MFAChallenge({ mfaToken, email, onVerified }: MFAChallengeProps) {
  const { t } = useLanguage();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!code.trim()) {
      setError(t('auth.mfaCodeRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.verifyMfa({ mfaToken, code: code.trim() });
      await onVerified();
    } catch (err) {
      setError(getApiErrorMessage(err, t('auth.mfaInvalid')));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {email ? <p className="text-sm text-muted-foreground">{email}</p> : null}

      <div className="space-y-2">
        <Label htmlFor="mfa-code">{t('auth.mfaCodeLabel')}</Label>
        <Input
          id="mfa-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t('auth.otpPlaceholder')}
          required
        />
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <Button type="submit" className="w-full" loading={isSubmitting}>
        {isSubmitting ? t('auth.verifying') : t('auth.mfaSubmit')}
      </Button>
    </form>
  );
}
