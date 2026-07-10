import { useLanguage } from '@/shared/languages';
import type { PasswordRule } from '../utils/passwordPolicy';
import { getPasswordStrength, validatePassword } from '../utils/passwordPolicy';

interface PasswordStrengthMeterProps {
  password: string;
}

const RULE_KEYS: Record<PasswordRule, string> = {
  minLength: 'auth.passwordRuleMinLength',
  uppercase: 'auth.passwordRuleUppercase',
  lowercase: 'auth.passwordRuleLowercase',
  number: 'auth.passwordRuleNumber',
  symbol: 'auth.passwordRuleSymbol',
};

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { t } = useLanguage();
  const { errors } = validatePassword(password);
  const strength = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-overlay">
        <div
          className="h-full rounded-full bg-foreground transition-all"
          style={{ width: `${strength}%` }}
          role="progressbar"
          aria-valuenow={strength}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('auth.passwordStrength')}
        />
      </div>
      <ul className="space-y-1 text-xs text-muted-foreground">
        {(Object.keys(RULE_KEYS) as PasswordRule[]).map((rule) => {
          const passed = !errors.includes(rule);
          return (
            <li key={rule} className={passed ? 'text-foreground' : undefined}>
              {passed ? t('auth.passwordRulePass') : t('auth.passwordRuleFail')} {t(RULE_KEYS[rule])}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
