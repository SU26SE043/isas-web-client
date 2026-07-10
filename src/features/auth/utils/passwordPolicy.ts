export const PASSWORD_MIN_LENGTH = 12;

export interface PasswordValidationResult {
  valid: boolean;
  errors: PasswordRule[];
}

export type PasswordRule =
  | 'minLength'
  | 'uppercase'
  | 'lowercase'
  | 'number'
  | 'symbol';

const RULE_CHECKS: Record<PasswordRule, (password: string) => boolean> = {
  minLength: (p) => p.length >= PASSWORD_MIN_LENGTH,
  uppercase: (p) => /[A-Z]/.test(p),
  lowercase: (p) => /[a-z]/.test(p),
  number: (p) => /\d/.test(p),
  symbol: (p) => /[^A-Za-z0-9]/.test(p),
};

export function validatePassword(password: string): PasswordValidationResult {
  const errors = (Object.keys(RULE_CHECKS) as PasswordRule[]).filter(
    (rule) => !RULE_CHECKS[rule](password),
  );
  return { valid: errors.length === 0, errors };
}

export function getPasswordStrength(password: string): number {
  if (!password) return 0;
  const passed = (Object.keys(RULE_CHECKS) as PasswordRule[]).filter((rule) =>
    RULE_CHECKS[rule](password),
  ).length;
  return Math.round((passed / Object.keys(RULE_CHECKS).length) * 100);
}
